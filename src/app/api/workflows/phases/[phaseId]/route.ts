import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const phaseSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  order: z.number().int().min(1),
  estimatedDuration: z.number().int().min(0).optional(),
});

interface RouteParams {
  phaseId: string;
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

// Helper function to validate phase existence and get workflow info
async function validatePhase(phaseId: string) {
  const phase = await prisma.workflowPhase.findUnique({
    where: { id: phaseId },
    include: {
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
      _count: {
        select: {
          tasks: true,
          projectPhases: true,
        },
      },
    },
  });

  if (!phase) {
    throw new Error('Phase not found');
  }

  if (!phase.workflow.isActive) {
    throw new Error('Cannot modify phases in inactive workflow');
  }

  return phase;
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

    // Validate phase existence and workflow status
    const phase = await validatePhase(params.phaseId);

    // Parse and validate request body
    const json = await request.json();
    const body = phaseSchema.parse(json);

    // Check for duplicate phase name in the same workflow
    const existingPhase = await prisma.workflowPhase.findFirst({
      where: {
        name: body.name,
        workflowId: phase.workflowId,
        id: { not: params.phaseId },
      },
    });

    if (existingPhase) {
      return new NextResponse(
        'A phase with this name already exists in this workflow',
        { status: 409 }
      );
    }

    // Check if order needs to be updated
    if (body.order !== phase.order) {
      // Get all phases in the workflow
      const workflowPhases = await prisma.workflowPhase.findMany({
        where: { workflowId: phase.workflowId },
        orderBy: { order: 'asc' },
      });

      // Validate that the new order is within bounds
      if (body.order > workflowPhases.length) {
        return new NextResponse(
          'Phase order cannot exceed the total number of phases',
          { status: 400 }
        );
      }
    }

    const updatedPhase = await prisma.workflowPhase.update({
      where: { id: params.phaseId },
      data: {
        name: body.name,
        description: body.description,
        order: body.order,
        estimatedDuration: body.estimatedDuration,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(updatedPhase);
  } catch (error) {
    console.error('Error updating phase:', error);

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
        return new NextResponse('Phase not found', { status: 404 });
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
      if (error.message === 'Phase not found') {
        return new NextResponse('Phase not found', { status: 404 });
      }
      if (error.message === 'Cannot modify phases in inactive workflow') {
        return new NextResponse('Cannot modify phases in inactive workflow', { status: 400 });
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

    // Check if phase exists and get related counts
    const phase = await validatePhase(params.phaseId);

    // Prevent deletion if phase has associated project phases
    if (phase._count.projectPhases > 0) {
      return new NextResponse(
        'Cannot delete phase with associated project phases',
        { status: 409 }
      );
    }

    // Prevent deletion if workflow has active projects
    if (phase.workflow._count.projects > 0) {
      return new NextResponse(
        'Cannot delete phase from workflow with active projects',
        { status: 409 }
      );
    }

    await prisma.workflowPhase.delete({
      where: { id: params.phaseId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting phase:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse('Phase not found', { status: 404 });
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
      if (error.message === 'Phase not found') {
        return new NextResponse('Phase not found', { status: 404 });
      }
      if (error.message === 'Cannot modify phases in inactive workflow') {
        return new NextResponse('Cannot modify phases in inactive workflow', { status: 400 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 