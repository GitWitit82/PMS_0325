import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { type Session } from "next-auth";
import { Prisma } from "@prisma/client";

const duplicateSchema = z.object({
  name: z.string().min(1),
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

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflowId = request.nextUrl.pathname.split('/')[3];
    const body = await request.json();
    const validatedData = duplicateSchema.parse(body);

    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Validate user permissions
    await validateUserPermissions(session);

    // Check for duplicate name
    const existingWorkflowWithName = await prisma.workflow.findFirst({
      where: { name: existingWorkflow.name },
    });

    if (existingWorkflowWithName) {
      return NextResponse.json(
        { error: "A workflow with this name already exists" },
        { status: 409 }
      );
    }

    const duplicatedWorkflow = await prisma.workflow.create({
      data: {
        name: validatedData.name,
        description: existingWorkflow.description,
        version: existingWorkflow.version,
        isActive: existingWorkflow.isActive,
        createdById: session.user.id,
        phases: {
          create: existingWorkflow.phases.map(phase => ({
            name: phase.name,
            description: phase.description,
            order: phase.order,
            estimatedDuration: phase.estimatedDuration,
            tasks: {
              create: phase.tasks.map(task => ({
                name: task.name,
                description: task.description,
                estimatedHours: task.estimatedHours,
                priority: task.priority,
                requiredSkills: task.requiredSkills as Prisma.InputJsonValue,
                formTemplateJson: task.formTemplateJson as Prisma.InputJsonValue
              }))
            }
          }))
        }
      },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(duplicatedWorkflow);
  } catch (error) {
    console.error('Error duplicating workflow:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to duplicate workflow" },
      { status: 500 }
    );
  }
} 