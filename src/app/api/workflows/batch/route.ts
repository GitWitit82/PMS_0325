import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { WorkflowUpdateData } from "@/types/workflow";
import { type Session } from "next-auth";

const batchUpdateSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(255).trim(),
    description: z.string().max(1000).trim().optional(),
    version: z.string().min(1).max(50).trim(),
    isActive: z.boolean(),
  })).min(1).max(50),
});

const batchPatchSchema = z.object({
  ids: z.array(z.string()).min(1),
  data: z.object({
    name: z.string().min(1).max(255).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    version: z.string().min(1).max(50).trim().optional(),
    isActive: z.boolean().optional(),
  }),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

// Helper function to check if user has required role
async function validateUserPermissions(session: Session | null) {
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

// Helper function to validate workflows and check constraints
async function validateWorkflows(ids: string[]) {
  const workflows = await prisma.workflow.findMany({
    where: { id: { in: ids } },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (workflows.length !== ids.length) {
    throw new Error('One or more workflows not found');
  }

  const workflowsWithProjects = workflows.filter(w => w._count.projects > 0);
  if (workflowsWithProjects.length > 0) {
    throw new Error(`Cannot modify workflows with active projects: ${workflowsWithProjects.map(w => w.id).join(', ')}`);
  }

  return workflows;
}

interface RouteParams {
  workflowId?: string;
  phaseId?: string;
  taskId?: string;
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const params: RouteParams = {};
    const pathParts = url.pathname.split("/");
    if (pathParts.includes("workflows")) {
      const workflowId = pathParts[pathParts.indexOf("workflows") + 1];
      if (workflowId && workflowId !== "batch") params.workflowId = workflowId;
    }
    if (pathParts.includes("phases")) {
      const phaseId = pathParts[pathParts.indexOf("phases") + 1];
      if (phaseId && phaseId !== "batch") params.phaseId = phaseId;
    }
    if (pathParts.includes("tasks")) {
      const taskId = pathParts[pathParts.indexOf("tasks") + 1];
      if (taskId && taskId !== "batch") params.taskId = taskId;
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Parse and validate request body
    const json = await request.json();
    const { items } = batchUpdateSchema.parse(json);

    // Check for duplicate names across all workflows
    const names = items.map(item => item.name);
    const existingWorkflows = await prisma.workflow.findMany({
      where: {
        name: { in: names },
        id: { notIn: items.map(item => item.id) },
      },
    });

    if (existingWorkflows.length > 0) {
      return new NextResponse(
        `Workflows with these names already exist: ${existingWorkflows.map(w => w.name).join(', ')}`,
        { status: 409 }
      );
    }

    // Validate all workflows exist and check constraints
    await validateWorkflows(items.map(item => item.id));

    // Perform batch update using transaction
    const results = await prisma.$transaction(
      items.map(item =>
        prisma.workflow.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            version: item.version,
            isActive: item.isActive,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: {
                phases: true,
                projects: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in batch workflow update:', error);

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
        return new NextResponse('One or more workflows not found', { status: 404 });
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
      if (error.message.startsWith('Cannot modify workflows')) {
        return new NextResponse(error.message, { status: 409 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const params: RouteParams = {};
    const pathParts = url.pathname.split("/");
    if (pathParts.includes("workflows")) {
      const workflowId = pathParts[pathParts.indexOf("workflows") + 1];
      if (workflowId && workflowId !== "batch") params.workflowId = workflowId;
    }
    if (pathParts.includes("phases")) {
      const phaseId = pathParts[pathParts.indexOf("phases") + 1];
      if (phaseId && phaseId !== "batch") params.phaseId = phaseId;
    }
    if (pathParts.includes("tasks")) {
      const taskId = pathParts[pathParts.indexOf("tasks") + 1];
      if (taskId && taskId !== "batch") params.taskId = taskId;
    }
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Parse and validate request body
    const json = await request.json();
    const { ids } = batchDeleteSchema.parse(json);

    // Validate all workflows exist and check constraints
    await validateWorkflows(ids);

    // Perform batch delete using transaction
    await prisma.$transaction([
      // First delete all phases and tasks
      prisma.workflowTask.deleteMany({
        where: {
          phase: {
            workflowId: { in: ids },
          },
        },
      }),
      prisma.workflowPhase.deleteMany({
        where: {
          workflowId: { in: ids },
        },
      }),
      // Then delete the workflows
      prisma.workflow.deleteMany({
        where: {
          id: { in: ids },
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in batch workflow delete:', error);

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
        return new NextResponse('One or more workflows not found', { status: 404 });
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
      if (error.message.startsWith('Cannot modify workflows')) {
        return new NextResponse(error.message, { status: 409 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids, data } = batchPatchSchema.parse(body);

    const updatedWorkflows = await prisma.workflow.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: data as WorkflowUpdateData,
    });

    return NextResponse.json(updatedWorkflows);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update workflows" },
      { status: 500 }
    );
  }
} 