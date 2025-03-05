import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const duplicateSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  version: z.string().min(1).max(50).trim().default('1.0'),
  isActive: z.boolean().default(true),
});

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

export async function POST(
  request: Request,
  { params }: { params: { workflowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Parse and validate request body
    const json = await request.json();
    const { name, description, version, isActive } = duplicateSchema.parse(json);

    // Check if workflow exists
    const sourceWorkflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
      include: {
        phases: {
          include: {
            tasks: {
              include: {
                dependsOn: true,
                dependedOnBy: true,
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!sourceWorkflow) {
      return new NextResponse('Source workflow not found', { status: 404 });
    }

    // Check for duplicate name
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { name },
    });

    if (existingWorkflow) {
      return new NextResponse('A workflow with this name already exists', { status: 409 });
    }

    // Create new workflow with phases and tasks using a transaction
    const newWorkflow = await prisma.$transaction(async (tx) => {
      // Create the new workflow
      const workflow = await tx.workflow.create({
        data: {
          name,
          description,
          version,
          isActive,
          createdById: session.user.id,
        },
      });

      // Create phases
      const phaseMap = new Map(); // Map to store old phase ID to new phase ID
      for (const phase of sourceWorkflow.phases) {
        const newPhase = await tx.workflowPhase.create({
          data: {
            workflowId: workflow.id,
            name: phase.name,
            description: phase.description,
            order: phase.order,
            estimatedDuration: phase.estimatedDuration,
          },
        });
        phaseMap.set(phase.id, newPhase.id);
      }

      // Create tasks and store their mappings
      const taskMap = new Map(); // Map to store old task ID to new task ID
      for (const phase of sourceWorkflow.phases) {
        for (const task of phase.tasks) {
          const newTask = await tx.workflowTask.create({
            data: {
              phaseId: phaseMap.get(phase.id)!,
              name: task.name,
              description: task.description,
              estimatedHours: task.estimatedHours,
              priority: task.priority,
              requiredSkills: task.requiredSkills,
              formTemplateJson: task.formTemplateJson,
            },
          });
          taskMap.set(task.id, newTask.id);
        }
      }

      // Create task dependencies
      for (const phase of sourceWorkflow.phases) {
        for (const task of phase.tasks) {
          // Handle dependencies where this task depends on others
          for (const dep of task.dependsOn) {
            await tx.taskDependency.create({
              data: {
                sourceTaskId: taskMap.get(task.id)!,
                targetTaskId: taskMap.get(dep.targetTaskId)!,
                dependencyType: dep.dependencyType,
              },
            });
          }
        }
      }

      // Return the complete workflow with all its relations
      return await tx.workflow.findUnique({
        where: { id: workflow.id },
        include: {
          phases: {
            include: {
              tasks: {
                include: {
                  dependsOn: true,
                  dependedOnBy: true,
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    return NextResponse.json(newWorkflow);
  } catch (error) {
    console.error('Error in workflow duplication:', error);

    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: 'Validation error',
        details: error.errors,
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      if (error.message === 'Insufficient permissions') {
        return new NextResponse('Insufficient permissions', { status: 403 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 