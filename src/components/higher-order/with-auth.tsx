"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface WithAuthProps {
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * HOC to protect routes that require authentication
 * @param Component - Component to wrap
 * @param options - Authentication options
 */
export function withAuth<T extends WithAuthProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithAuthComponent(props: T) {
    const { requireAuth = true, redirectTo = "/auth/signin", ...rest } = props
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
      if (status === "loading") return

      const isAuthenticated = !!session
      if (requireAuth && !isAuthenticated) {
        router.replace(redirectTo)
      }
    }, [session, status, requireAuth, redirectTo, router])

    if (status === "loading") {
      return null // Or a loading spinner component
    }

    return <WrappedComponent {...(rest as T)} />
  }
} 