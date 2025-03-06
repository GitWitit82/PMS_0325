import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"

/**
 * GET handler for project statistics
 */
export async function GET() {
  try {
    // Get project statistics
    const [
      totalProjects,
      activeProjects,
      projectsByStatus,
      projectsByPriority,
      projectsByDepartment,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: { status: ProjectStatus.ACTIVE }
      }),
      prisma.project.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ["priority"],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ["departmentId"],
        _count: true,
      }),
    ])

    return NextResponse.json({
      totalProjects,
      activeProjects,
      projectsByStatus,
      projectsByPriority,
      projectsByDepartment,
    })
  } catch (error) {
    console.error("Error fetching project statistics:", error)
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    )
  }
} 