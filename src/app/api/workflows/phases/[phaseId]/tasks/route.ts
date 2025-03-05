import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    phaseId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { phaseId } = params;

    const tasks = await prisma.workflowTask.findMany({
      where: {
        phaseId,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching workflow tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { phaseId } = params;
    const json = await request.json();
    const { name, description, estimatedHours, priority, requiredSkills } = json;

    const task = await prisma.workflowTask.create({
      data: {
        name,
        description,
        estimatedHours,
        priority,
        requiredSkills,
        phase: {
          connect: {
            id: phaseId,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating workflow task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 