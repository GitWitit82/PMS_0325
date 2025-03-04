"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { TokenService } from "@/lib/auth/token-service"

interface SessionManagerProps {
  children: React.ReactNode
  inactivityTimeout?: number // Time in minutes
  warningTime?: number // Time in seconds before timeout to show warning
}

export function SessionManager({
  children,
  inactivityTimeout = 30, // Default 30 minutes
  warningTime = 60, // Default 60 seconds warning
}: SessionManagerProps) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [showWarning, setShowWarning] = useState(false)

  // Convert timeout to milliseconds
  const timeoutMs = inactivityTimeout * 60 * 1000
  const warningMs = warningTime * 1000

  // Handle session expiration
  const handleSessionExpiration = useCallback(async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin?error=SessionExpired")
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    })
  }, [router])

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    setShowWarning(false)
  }, [])

  // Handle user activity
  useEffect(() => {
    if (status !== "authenticated") return

    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ]

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, updateActivity)
    })

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [status, updateActivity])

  // Check for inactivity
  useEffect(() => {
    if (status !== "authenticated") return

    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity

      // Show warning before session expires
      if (timeSinceLastActivity >= timeoutMs - warningMs && !showWarning) {
        setShowWarning(true)
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${warningTime} seconds due to inactivity.`,
          variant: "destructive",
          action: (
            <button
              onClick={updateActivity}
              className="rounded bg-primary px-3 py-1 text-primary-foreground"
            >
              Keep Session Active
            </button>
          ),
        })
      }

      // Handle session expiration
      if (timeSinceLastActivity >= timeoutMs) {
        handleSessionExpiration()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastActivity, timeoutMs, warningMs, showWarning, status, handleSessionExpiration, updateActivity, warningTime])

  // Token refresh logic
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) return

    const checkAndRefreshToken = async () => {
      try {
        if (TokenService.isTokenExpired(session.accessToken as string)) {
          const newToken = await TokenService.refreshToken(session.accessToken as string)
          if (newToken) {
            await update({ accessToken: newToken })
          } else {
            handleSessionExpiration()
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error)
        handleSessionExpiration()
      }
    }

    const tokenCheckInterval = setInterval(checkAndRefreshToken, 1000 * 60) // Check every minute
    checkAndRefreshToken() // Initial check

    return () => clearInterval(tokenCheckInterval)
  }, [session, status, update, handleSessionExpiration])

  return <>{children}</>
} 