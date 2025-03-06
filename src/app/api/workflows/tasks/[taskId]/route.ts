import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get taskId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const taskId = pathParts[pathParts.indexOf('tasks') + 1];

    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    const task = await prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: {
        dependsOn: true,
        dependedOnBy: true,
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get taskId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const taskId = pathParts[pathParts.indexOf('tasks') + 1];

    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    const json = await request.json();
    const { name, description, estimatedHours, priority, requiredSkills, formTemplateJson } = json;

    const task = await prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        name,
        description,
        estimatedHours,
        priority,
        requiredSkills,
        formTemplateJson,
      },
      include: {
        dependsOn: true,
        dependedOnBy: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get taskId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const taskId = pathParts[pathParts.indexOf('tasks') + 1];

    if (!taskId) {
      return new NextResponse('Task ID is required', { status: 400 });
    }

    await prisma.workflowTask.delete({
      where: { id: taskId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 