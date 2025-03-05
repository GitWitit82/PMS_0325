import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schemas
const batchUpdateSchema = z.object({
  tasks: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255).trim(),
    description: z.string().max(1000).trim().optional(),
    estimatedHours: z.number().min(0).max(1000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    requiredSkills: z.array(z.string()).optional(),
    formTemplateJson: z.any().optional(),
  })).min(1).max(50),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

const batchDependencySchema = z.object({
  dependencies: z.array(z.object({
    sourceTaskId: z.string().uuid(),
    targetTaskId: z.string().uuid(),
    dependencyType: z.enum(['FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH']),
  })).min(1).max(50),
});

// Helper functions
async function validateUserPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || !['ADMINISTRATOR', 'MANAGER'].includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
}

async function validateTasks(taskIds: string[]) {
  const tasks = await prisma.workflowTask.findMany({
    where: { id: { in: taskIds } },
    include: {
      phase: {
        include: {
          workflow: {
            include: {
              projects: {
                where: { status: { in: ['ACTIVE', 'ON_HOLD'] } },
              },
            },
          },
        },
      },
      projectTasks: {
        take: 1,
      },
    },
  });

  if (tasks.length !== taskIds.length) {
    throw new Error('One or more tasks not found');
  }

  // Check if any task's workflow has active projects
  const hasActiveProjects = tasks.some(task => task.phase.workflow.projects.length > 0);
  if (hasActiveProjects) {
    throw new Error('Cannot modify tasks in workflows with active projects');
  }

  // Check if any task has associated project tasks
  const hasProjectTasks = tasks.some(task => task.projectTasks.length > 0);
  if (hasProjectTasks) {
    throw new Error('Cannot modify tasks that have associated project tasks');
  }

  return tasks;
}

// Route handlers
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await validateUserPermissions(session.user.id);

    const body = await request.json();
    const { tasks } = batchUpdateSchema.parse(body);

    // Validate tasks existence and constraints
    await validateTasks(tasks.map(t => t.id));

    // Check for duplicate names within the same phase
    const tasksByPhase = await prisma.workflowTask.findMany({
      where: { id: { in: tasks.map(t => t.id) } },
      include: { phase: true },
    });

    const phaseIds = [...new Set(tasksByPhase.map(t => t.phase.id))];
    const existingTasks = await prisma.workflowTask.findMany({
      where: { phaseId: { in: phaseIds } },
    });

    for (const phaseId of phaseIds) {
      const phaseTasks = tasks.filter(t => 
        tasksByPhase.find(pt => pt.id === t.id)?.phase.id === phaseId
      );
      const phaseExistingTasks = existingTasks.filter(t => t.phaseId === phaseId);

      const names = new Set();
      for (const task of phaseTasks) {
        if (names.has(task.name.toLowerCase())) {
          throw new Error(`Duplicate task name "${task.name}" in the same phase`);
        }
        names.add(task.name.toLowerCase());

        // Check against existing tasks (excluding the ones being updated)
        const duplicate = phaseExistingTasks.find(
          t => t.id !== task.id && t.name.toLowerCase() === task.name.toLowerCase()
        );
        if (duplicate) {
          throw new Error(`Task name "${task.name}" already exists in the phase`);
        }
      }
    }

    // Perform batch update
    const updatedTasks = await prisma.$transaction(
      tasks.map(task => 
        prisma.workflowTask.update({
          where: { id: task.id },
          data: {
            name: task.name,
            description: task.description,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
            requiredSkills: task.requiredSkills,
            formTemplateJson: task.formTemplateJson,
          },
          include: {
            phase: {
              include: {
                workflow: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json(updatedTasks);

  } catch (error) {
    console.error('Batch update tasks error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error', code: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await validateUserPermissions(session.user.id);

    const body = await request.json();
    const { ids } = batchDeleteSchema.parse(body);

    // Validate tasks existence and constraints
    await validateTasks(ids);

    // Delete task dependencies first, then the tasks
    await prisma.$transaction([
      prisma.taskDependency.deleteMany({
        where: {
          OR: [
            { sourceTaskId: { in: ids } },
            { targetTaskId: { in: ids } },
          ],
        },
      }),
      prisma.workflowTask.deleteMany({
        where: { id: { in: ids } },
      }),
    ]);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Batch delete tasks error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error', code: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await validateUserPermissions(session.user.id);

    const body = await request.json();
    const { dependencies } = batchDependencySchema.parse(body);

    // Get all task IDs involved
    const taskIds = [...new Set([
      ...dependencies.map(d => d.sourceTaskId),
      ...dependencies.map(d => d.targetTaskId),
    ])];

    // Validate tasks existence and constraints
    await validateTasks(taskIds);

    // Check for circular dependencies
    const dependencyMap = new Map<string, Set<string>>();
    for (const { sourceTaskId, targetTaskId } of dependencies) {
      if (!dependencyMap.has(sourceTaskId)) {
        dependencyMap.set(sourceTaskId, new Set());
      }
      dependencyMap.get(sourceTaskId)!.add(targetTaskId);
    }

    function hasCircularDependency(taskId: string, visited: Set<string> = new Set()): boolean {
      if (visited.has(taskId)) return true;
      visited.add(taskId);
      const deps = dependencyMap.get(taskId);
      if (deps) {
        for (const depId of deps) {
          if (hasCircularDependency(depId, new Set(visited))) return true;
        }
      }
      return false;
    }

    for (const taskId of dependencyMap.keys()) {
      if (hasCircularDependency(taskId)) {
        throw new Error('Circular dependencies detected');
      }
    }

    // Update dependencies
    await prisma.$transaction([
      // Clear existing dependencies for involved tasks
      prisma.taskDependency.deleteMany({
        where: {
          OR: [
            { sourceTaskId: { in: taskIds } },
            { targetTaskId: { in: taskIds } },
          ],
        },
      }),
      // Create new dependencies
      prisma.taskDependency.createMany({
        data: dependencies,
      }),
    ]);

    // Return updated dependencies
    const updatedDependencies = await prisma.taskDependency.findMany({
      where: {
        OR: [
          { sourceTaskId: { in: taskIds } },
          { targetTaskId: { in: taskIds } },
        ],
      },
      include: {
        sourceTask: true,
        targetTask: true,
      },
    });

    return NextResponse.json(updatedDependencies);

  } catch (error) {
    console.error('Batch update dependencies error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error', code: error.code }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
} 