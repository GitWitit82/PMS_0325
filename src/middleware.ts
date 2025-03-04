import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Middleware configuration for protected routes and role-based access
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
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
      if (token?.role !== "ADMINISTRATOR") {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

/**
 * Configure which routes to protect with middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
} 