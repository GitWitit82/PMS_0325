import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * GET handler for project statistics
 */
export async function GET() {
  try {
    const [
      totalProjects,
      activeProjects,
      projectsByStatus,
      projectsByDepartment
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: { status: "IN_PROGRESS" }
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ["departmentId"],
        _count: true,
        where: {
          departmentId: { not: null }
        }
      })
    ])

    return NextResponse.json({
      totalProjects,
      activeProjects,
      projectsByStatus,
      projectsByDepartment
    })
  } catch (error) {
    console.error("Failed to fetch project statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    )
  }
} 