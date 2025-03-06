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

    // Get phaseId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const phaseId = pathParts[pathParts.indexOf('phases') + 1];

    if (!phaseId) {
      return new NextResponse('Phase ID is required', { status: 400 });
    }

    const phase = await prisma.workflowPhase.findUnique({
      where: { id: phaseId },
      include: {
        tasks: {
          include: {
            dependsOn: true,
            dependedOnBy: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!phase) {
      return new NextResponse('Phase not found', { status: 404 });
    }

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error fetching phase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get phaseId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const phaseId = pathParts[pathParts.indexOf('phases') + 1];

    if (!phaseId) {
      return new NextResponse('Phase ID is required', { status: 400 });
    }

    const json = await request.json();
    const { name, description, order, estimatedDuration } = json;

    const phase = await prisma.workflowPhase.update({
      where: { id: phaseId },
      data: {
        name,
        description,
        order,
        estimatedDuration,
      },
      include: {
        tasks: {
          include: {
            dependsOn: true,
            dependedOnBy: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error updating phase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get phaseId from URL
    const pathParts = new URL(request.url).pathname.split('/');
    const phaseId = pathParts[pathParts.indexOf('phases') + 1];

    if (!phaseId) {
      return new NextResponse('Phase ID is required', { status: 400 });
    }

    await prisma.workflowPhase.delete({
      where: { id: phaseId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting phase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 