import { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { ProjectsOverview } from "@/components/dashboard/projects-overview"
import { ResourceUtilization } from "@/components/dashboard/resource-utilization"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"

export const metadata: Metadata = {
  title: "Dashboard | Resource and Project Management System",
  description: "Overview of your projects and resources",
}

/**
 * Dashboard page component
 */
export default async function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Overview of your projects and resources"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ProjectsOverview className="col-span-4" />
        <ResourceUtilization className="col-span-3" />
      </div>
      <div className="mt-4">
        <UpcomingTasks />
      </div>
    </DashboardShell>
  )
} 