import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

interface RouteParams {
  workflowId?: string;
  phaseId?: string;
  taskId?: string;
}

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).trim().optional(),
  version: z.string().min(1).max(50).trim(),
  isActive: z.boolean(),
});

export async function GET(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workflows = await prisma.workflow.findMany({
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const validatedData = createWorkflowSchema.parse(json);

    const workflow = await prisma.workflow.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        version: validatedData.version,
        isActive: validatedData.isActive,
        createdBy: {
          connect: {
            id: session.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            phases: true,
          },
        },
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
} 