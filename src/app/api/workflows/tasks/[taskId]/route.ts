import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const taskSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  estimatedHours: z.number().min(0).max(1000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  requiredSkills: z.array(z.string().min(1).max(100)).optional(),
  formTemplateJson: z.record(z.unknown()).optional(),
});

interface RouteParams {
  taskId: string;
}

// Helper function to check if user has required role
async function validateUserPermissions(session: any) {
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
}

// Helper function to validate task existence and get related info
async function validateTask(taskId: string) {
  const task = await prisma.workflowTask.findUnique({
    where: { id: taskId },
    include: {
      phase: {
        select: {
          workflow: {
            select: {
              isActive: true,
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          projectTasks: true,
          dependedOnBy: true,
          dependsOn: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (!task.phase.workflow.isActive) {
    throw new Error('Cannot modify tasks in inactive workflow');
  }

  return task;
}

export async function PUT(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Validate task existence and workflow status
    const task = await validateTask(params.taskId);

    // Parse and validate request body
    const json = await request.json();
    const body = taskSchema.parse(json);

    // Check for duplicate task name in the same phase
    const existingTask = await prisma.workflowTask.findFirst({
      where: {
        name: body.name,
        phaseId: task.phaseId,
        id: { not: params.taskId },
      },
    });

    if (existingTask) {
      return new NextResponse(
        'A task with this name already exists in this phase',
        { status: 409 }
      );
    }

    // Validate required skills format if provided
    if (body.requiredSkills?.length) {
      const uniqueSkills = new Set(body.requiredSkills);
      if (uniqueSkills.size !== body.requiredSkills.length) {
        return new NextResponse(
          'Required skills must be unique',
          { status: 400 }
        );
      }
    }

    const updatedTask = await prisma.workflowTask.update({
      where: { id: params.taskId },
      data: {
        name: body.name,
        description: body.description,
        estimatedHours: body.estimatedHours,
        priority: body.priority,
        requiredSkills: body.requiredSkills,
        formTemplateJson: body.formTemplateJson,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            projectTasks: true,
            dependedOnBy: true,
            dependsOn: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);

    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: 'Validation error',
        details: error.errors,
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse('Task not found', { status: 404 });
      }
      return new NextResponse('Database error', { status: 400 });
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      if (error.message === 'Insufficient permissions') {
        return new NextResponse('Insufficient permissions', { status: 403 });
      }
      if (error.message === 'Task not found') {
        return new NextResponse('Task not found', { status: 404 });
      }
      if (error.message === 'Cannot modify tasks in inactive workflow') {
        return new NextResponse('Cannot modify tasks in inactive workflow', { status: 400 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Check if task exists and get related counts
    const task = await validateTask(params.taskId);

    // Prevent deletion if task has associated project tasks
    if (task._count.projectTasks > 0) {
      return new NextResponse(
        'Cannot delete task with associated project tasks',
        { status: 409 }
      );
    }

    // Prevent deletion if task has dependencies
    if (task._count.dependedOnBy > 0 || task._count.dependsOn > 0) {
      return new NextResponse(
        'Cannot delete task with dependencies',
        { status: 409 }
      );
    }

    // Prevent deletion if workflow has active projects
    if (task.phase.workflow._count.projects > 0) {
      return new NextResponse(
        'Cannot delete task from workflow with active projects',
        { status: 409 }
      );
    }

    await prisma.workflowTask.delete({
      where: { id: params.taskId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse('Task not found', { status: 404 });
      }
      return new NextResponse('Database error', { status: 400 });
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      if (error.message === 'Insufficient permissions') {
        return new NextResponse('Insufficient permissions', { status: 403 });
      }
      if (error.message === 'Task not found') {
        return new NextResponse('Task not found', { status: 404 });
      }
      if (error.message === 'Cannot modify tasks in inactive workflow') {
        return new NextResponse('Cannot modify tasks in inactive workflow', { status: 400 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 