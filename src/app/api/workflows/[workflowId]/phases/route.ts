import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    workflowId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workflowId } = params;

    const phases = await prisma.workflowPhase.findMany({
      where: {
        workflowId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(phases);
  } catch (error) {
    console.error('Error fetching workflow phases:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workflowId } = params;
    const json = await request.json();
    const { name, description, order, estimatedDuration } = json;

    const phase = await prisma.workflowPhase.create({
      data: {
        name,
        description,
        order,
        estimatedDuration,
        workflow: {
          connect: {
            id: workflowId,
          },
        },
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Error creating workflow phase:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 