import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { TokenService } from "@/lib/auth/token-service"
import { UserRole } from "@prisma/client"

// Define route permissions
const routePermissions: Record<string, UserRole[]> = {
  "/admin": ["ADMINISTRATOR"],
  "/admin/users": ["ADMINISTRATOR"],
  "/projects/create": ["ADMINISTRATOR", "MANAGER"],
  "/projects/edit": ["ADMINISTRATOR", "MANAGER"],
  "/reports": ["ADMINISTRATOR", "MANAGER", "SUPERVISOR"],
}

export default async function middleware(req: NextRequest) {
  const session = await auth()
  const isAuth = !!session
  const role = session?.user?.role as UserRole
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

  // Check if user is authenticated
  if (!isAuth) {
    const redirectUrl = new URL("/auth/signin", req.url)
    redirectUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Check route permissions
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (path.startsWith(route) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
}

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