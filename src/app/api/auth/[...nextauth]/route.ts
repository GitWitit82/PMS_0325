import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth handler for authentication routes
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 