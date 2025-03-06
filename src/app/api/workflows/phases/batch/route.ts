import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const batchUpdateSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(255).trim(),
    description: z.string().max(1000).trim().optional(),
    order: z.number().int().min(1),
    estimatedDuration: z.number().int().min(0).optional(),
  })).min(1).max(50),
});

const batchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

const batchReorderSchema = z.object({
  workflowId: z.string(),
  phases: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(1),
  })).min(1),
});

// Helper function to check if user has required role
async function validateUserPermissions(session: { user?: { id?: string } }) {
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

// Helper function to validate phases and check constraints
async function validatePhases(ids: string[]) {
  const phases = await prisma.workflowPhase.findMany({
    where: { id: { in: ids } },
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

  if (phases.length !== ids.length) {
    throw new Error('One or more phases not found');
  }

  // Check if any phase belongs to an inactive workflow
  const inactiveWorkflowPhases = phases.filter(p => !p.workflow.isActive);
  if (inactiveWorkflowPhases.length > 0) {
    throw new Error('Cannot modify phases in inactive workflows');
  }

  // Check if any phase has associated project phases
  const phasesWithProjects = phases.filter(p => p._count.projectPhases > 0);
  if (phasesWithProjects.length > 0) {
    throw new Error(`Cannot modify phases with associated project phases: ${phasesWithProjects.map(p => p.id).join(', ')}`);
  }

  return phases;
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

    // Validate all phases exist and check constraints
    const phases = await validatePhases(items.map(item => item.id));

    // Group phases by workflow for duplicate name check
    const phasesByWorkflow = phases.reduce((acc, phase) => {
      if (!acc[phase.workflowId]) {
        acc[phase.workflowId] = [];
      }
      acc[phase.workflowId].push(phase);
      return acc;
    }, {} as Record<string, typeof phases>);

    // Check for duplicate names within each workflow
    for (const workflowId of Object.keys(phasesByWorkflow)) {
      const workflowPhaseNames = items
        .filter(item => phasesByWorkflow[workflowId].some(p => p.id === item.id))
        .map(item => item.name);

      const existingPhases = await prisma.workflowPhase.findMany({
        where: {
          workflowId,
          name: { in: workflowPhaseNames },
          id: { notIn: items.map(item => item.id) },
        },
      });

      if (existingPhases.length > 0) {
        return new NextResponse(
          `Phases with these names already exist in workflow ${workflowId}: ${existingPhases.map(p => p.name).join(', ')}`,
          { status: 409 }
        );
      }
    }

    // Perform batch update using transaction
    const results = await prisma.$transaction(
      items.map(item =>
        prisma.workflowPhase.update({
          where: { id: item.id },
          data: {
            name: item.name,
            description: item.description,
            order: item.order,
            estimatedDuration: item.estimatedDuration,
            updatedAt: new Date(),
          },
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in batch phase update:', error);

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
        return new NextResponse('One or more phases not found', { status: 404 });
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
      if (error.message.startsWith('Cannot modify phases')) {
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

    // Validate all phases exist and check constraints
    await validatePhases(ids);

    // Perform batch delete using transaction
    await prisma.$transaction([
      // First delete all tasks
      prisma.workflowTask.deleteMany({
        where: {
          phaseId: { in: ids },
        },
      }),
      // Then delete the phases
      prisma.workflowPhase.deleteMany({
        where: {
          id: { in: ids },
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in batch phase delete:', error);

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
        return new NextResponse('One or more phases not found', { status: 404 });
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
      if (error.message.startsWith('Cannot modify phases')) {
        return new NextResponse(error.message, { status: 409 });
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Special endpoint for reordering phases
export async function PATCH(request: Request) {
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
    const { workflowId, phases } = batchReorderSchema.parse(json);

    // Validate workflow exists and is active
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        _count: {
          select: {
            phases: true,
            projects: true,
          },
        },
      },
    });

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 });
    }

    if (!workflow.isActive) {
      return new NextResponse('Cannot modify phases in inactive workflow', { status: 400 });
    }

    if (workflow._count.projects > 0) {
      return new NextResponse('Cannot reorder phases in workflow with active projects', { status: 409 });
    }

    // Validate all phase IDs belong to this workflow
    const workflowPhases = await prisma.workflowPhase.findMany({
      where: { workflowId },
    });

    const invalidPhases = phases.filter(
      p => !workflowPhases.some(wp => wp.id === p.id)
    );

    if (invalidPhases.length > 0) {
      return new NextResponse(
        `These phases do not belong to the workflow: ${invalidPhases.map(p => p.id).join(', ')}`,
        { status: 400 }
      );
    }

    // Validate order numbers are unique and within bounds
    const orders = phases.map(p => p.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      return new NextResponse('Phase orders must be unique', { status: 400 });
    }

    if (Math.max(...orders) > workflowPhases.length) {
      return new NextResponse(
        'Phase order cannot exceed the total number of phases',
        { status: 400 }
      );
    }

    // Perform batch reorder using transaction
    const results = await prisma.$transaction(
      phases.map(phase =>
        prisma.workflowPhase.update({
          where: { id: phase.id },
          data: {
            order: phase.order,
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in phase reorder:', error);

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