import NextAuth from "next-auth"
import authConfig from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

/**
 * Middleware configuration for protected routes and role-based access
 */
export default auth((req) => {
  const { auth: session } = req
  const isAuth = !!session
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  // Redirect authenticated users away from auth pages
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return null
  }

  // Handle API routes
  if (isApiRoute) {
    if (!isAuth) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      )
    }
    return null
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user?.role !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return null
})

/**
 * Configure which routes to protect with middleware
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 