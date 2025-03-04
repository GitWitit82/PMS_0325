"use client"

import { useSession } from "next-auth/react"
import { ReactNode } from "react"

type Role = "ADMINISTRATOR" | "MANAGER" | "SUPERVISOR" | "TEAM_MEMBER" | "VIEWER"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
}

/**
 * Component to conditionally render content based on user role
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role as Role

  if (!session || !allowedRoles.includes(userRole)) {
    return fallback
  }

  return <>{children}</>
} 