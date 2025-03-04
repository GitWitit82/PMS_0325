"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type Role = "ADMINISTRATOR" | "MANAGER" | "SUPERVISOR" | "TEAM_MEMBER" | "VIEWER"

interface WithAuthorizationProps {
  allowedRoles: Role[]
}

/**
 * HOC to handle role-based access control
 * @param Component - Component to wrap
 * @param allowedRoles - Array of roles allowed to access the component
 */
export function withAuthorization<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  { allowedRoles }: WithAuthorizationProps
) {
  return function WithAuthorizationComponent(props: T) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
      if (status === "loading") return

      if (!session) {
        router.push("/auth/signin")
        return
      }

      const userRole = session.user.role as Role
      if (!allowedRoles.includes(userRole)) {
        router.push("/unauthorized")
      }
    }, [session, status, router])

    if (status === "loading") {
      return <div>Loading...</div>
    }

    if (!session || !allowedRoles.includes(session.user.role as Role)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
} 