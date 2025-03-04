import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { TokenService } from "@/lib/auth/token-service"

// Define route permissions
const routePermissions = {
  "/admin": ["ADMINISTRATOR"],
  "/admin/users": ["ADMINISTRATOR"],
  "/projects/create": ["ADMINISTRATOR", "MANAGER"],
  "/projects/edit": ["ADMINISTRATOR", "MANAGER"],
  "/reports": ["ADMINISTRATOR", "MANAGER", "SUPERVISOR"],
} as const

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const role = token?.role as string
    const path = req.nextUrl.pathname

    // Handle auth pages
    if (path.startsWith("/auth")) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // Validate JWT token
    const jwtToken = TokenService.getTokenFromRequest(req)
    if (jwtToken) {
      try {
        await TokenService.verifyToken(jwtToken)
      } catch (error) {
        return NextResponse.redirect(new URL("/auth/signin?error=InvalidToken", req.url))
      }
    }

    // Check route permissions
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (path.startsWith(route) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/admin/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
} 