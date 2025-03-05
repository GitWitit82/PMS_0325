import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const workflowSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  version: z.string().min(1).max(50).trim(),
  isActive: z.boolean(),
});

interface RouteParams {
  workflowId: string;
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

// Helper function to validate workflow existence
async function validateWorkflow(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  return workflow;
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

    // Validate workflow existence
    await validateWorkflow(params.workflowId);

    // Parse and validate request body
    const json = await request.json();
    const body = workflowSchema.parse(json);

    // Check for duplicate workflow name
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        name: body.name,
        id: { not: params.workflowId },
      },
    });

    if (existingWorkflow) {
      return new NextResponse(
        'A workflow with this name already exists',
        { status: 409 }
      );
    }

    const workflow = await prisma.workflow.update({
      where: { id: params.workflowId },
      data: {
        name: body.name,
        description: body.description,
        version: body.version,
        isActive: body.isActive,
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
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);

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
        return new NextResponse('Workflow not found', { status: 404 });
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
      if (error.message === 'Workflow not found') {
        return new NextResponse('Workflow not found', { status: 404 });
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

    // Check if workflow exists and get related counts
    const workflow = await validateWorkflow(params.workflowId);

    // Prevent deletion if workflow has associated projects
    if (workflow._count.projects > 0) {
      return new NextResponse(
        'Cannot delete workflow with associated projects',
        { status: 409 }
      );
    }

    await prisma.workflow.delete({
      where: { id: params.workflowId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting workflow:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new NextResponse('Workflow not found', { status: 404 });
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
      if (error.message === 'Workflow not found') {
        return new NextResponse('Workflow not found', { status: 404 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 