import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Array of paths that don't require authentication
const publicPaths = ["/", "/auth/signin", "/auth/signup", "/auth/error"]

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(publicPath => path === publicPath)

  // Get the token from the session cookie
  const token = request.cookies.get("next-auth.session-token")?.value

  // Redirect authenticated users to dashboard if they try to access public paths
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to signin if they try to access protected paths
  if (!token && !isPublicPath) {
    const signinUrl = new URL("/auth/signin", request.url)
    signinUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next (Next.js internals)
     * - static (static files)
     * - favicon.ico
     */
    "/((?!api|_next|static|favicon.ico).*)",
  ],
} 