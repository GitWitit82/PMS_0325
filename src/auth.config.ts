import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

export const authConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "example@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        // This is a basic example. In production, validate against your DB
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          
          // For testing purposes only! Replace with actual DB check
          if (email === "admin@example.com" && password === "password123") {
            return {
              id: "1",
              email: email,
              name: "Admin User",
              role: "ADMINISTRATOR",
            }
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      
      if (isOnDashboard || isOnAdmin) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/auth/login') {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role
      }
      return session
    }
  },
} satisfies NextAuthConfig

export default authConfig 