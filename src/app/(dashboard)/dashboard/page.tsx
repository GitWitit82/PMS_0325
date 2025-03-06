import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Session } from "next-auth"

export const metadata: Metadata = {
  title: "Dashboard | Resource and Project Management System",
  description: "Overview of your projects and resources",
}

/**
 * Dashboard page component
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as Session | null

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome back, {session.user?.name || "User"}!
      </p>
    </div>
  )
} 