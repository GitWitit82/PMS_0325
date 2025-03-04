"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Hook to protect routes that require authentication
 * @param {boolean} requireAuth - Whether authentication is required
 */
export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/login")
    }
  }, [requireAuth, status, router])

  return { session, status }
}

/**
 * Hook to check if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} Whether user has required role
 */
export function useAuthorization(allowedRoles: string[]) {
  const { data: session } = useSession()
  
  if (!session?.user?.role) {
    return false
  }

  return allowedRoles.includes(session.user.role)
} 