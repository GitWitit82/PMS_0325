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

    // Get workflowId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const workflowId = pathParts[pathParts.indexOf('workflows') + 1];

    if (!workflowId) {
      return new NextResponse('Workflow ID is required', { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        phases: {
          include: {
            tasks: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get workflowId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const workflowId = pathParts[pathParts.indexOf('workflows') + 1];

    if (!workflowId) {
      return new NextResponse('Workflow ID is required', { status: 400 });
    }

    const json = await request.json();
    const { name, description, version, isActive } = json;

    const workflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        name,
        description,
        version,
        isActive,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get workflowId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const workflowId = pathParts[pathParts.indexOf('workflows') + 1];

    if (!workflowId) {
      return new NextResponse('Workflow ID is required', { status: 400 });
    }

    await prisma.workflow.delete({
      where: { id: workflowId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 