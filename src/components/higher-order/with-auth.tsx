"use client"

import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

interface WithAuthProps {
  requiredRole?: UserRole
}

/**
 * HOC to protect routes that require authentication
 * @param Component - Component to wrap
 * @param options - Authentication options
 */
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: WithAuthProps = {}
) {
  return function ProtectedRoute(props: T) {
    const { session, status } = useAuth()

    if (status === "loading") {
      return <div>Loading...</div>
    }

    if (!session) {
      redirect("/login")
    }

    if (options.requiredRole && session.user.role !== options.requiredRole) {
      redirect("/unauthorized")
    }

    return <Component {...props} />
  }
} 