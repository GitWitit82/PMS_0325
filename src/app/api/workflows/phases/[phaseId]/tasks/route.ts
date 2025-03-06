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

    const tasks = await prisma.workflowTask.findMany({
      where: { phaseId },
      include: {
        dependsOn: true,
        dependedOnBy: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
    const { name, description, estimatedHours, priority, requiredSkills, formTemplateJson } = json;

    const task = await prisma.workflowTask.create({
      data: {
        name,
        description,
        estimatedHours,
        priority,
        requiredSkills,
        formTemplateJson,
        phase: {
          connect: {
            id: phaseId,
          },
        },
      },
      include: {
        dependsOn: true,
        dependedOnBy: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 