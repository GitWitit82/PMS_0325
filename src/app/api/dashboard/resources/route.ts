import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET handler for resource utilization
 */
export async function GET() {
  try {
    const [
      resourceUtilization,
      departmentCapacity,
      resourceAllocation
    ] = await Promise.all([
      prisma.resourceUtilization.findMany({
        take: 7, // Last 7 days
        orderBy: { date: "desc" },
        select: {
          date: true,
          utilizedPercentage: true,
          resourceId: true,
        }
      }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          resources: {
            select: {
              capacity: true,
            }
          }
        }
      }),
      prisma.resourceAllocation.findMany({
        where: {
          endDate: { gte: new Date() }
        },
        select: {
          resourceId: true,
          percentage: true,
          hours: true,
        }
      })
    ])

    return NextResponse.json({
      resourceUtilization,
      departmentCapacity,
      resourceAllocation
    })
  } catch (error) {
    console.error("Failed to fetch resource statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource statistics" },
      { status: 500 }
    )
  }
} 