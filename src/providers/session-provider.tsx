"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { SessionManager } from "@/components/auth/session-manager"

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionManager inactivityTimeout={30} warningTime={60}>
        {children}
      </SessionManager>
    </NextAuthSessionProvider>
  )
} 