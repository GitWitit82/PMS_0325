import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { TaskStatus } from "@prisma/client"

/**
 * GET handler for upcoming tasks
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    const upcomingTasks = await prisma.projectTask.findMany({
      where: {
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        ...(userId ? { assignedToId: userId } : {}),
        scheduledStart: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        projectPhase: {
          include: {
            project: {
              select: {
                name: true,
              }
            }
          }
        },
        assignedTo: {
          select: {
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        scheduledStart: "asc"
      },
      take: 10
    })

    return NextResponse.json(upcomingTasks)
  } catch (error) {
    console.error("Failed to fetch upcoming tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming tasks" },
      { status: 500 }
    )
  }
} 