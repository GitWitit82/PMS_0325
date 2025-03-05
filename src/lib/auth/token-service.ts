import { jwtVerify, SignJWT } from "jose"
import { NextRequest } from "next/server"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "your-secret-key"
)

const AUTH_COOKIE_NAME = "next-auth.session-token"

export interface JWTPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
  jti: string
}

export class TokenService {
  static async createToken(payload: Omit<JWTPayload, "iat" | "exp" | "jti">): Promise<string> {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 15 * 60 // 15 minutes expiration

    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .setJti(crypto.randomUUID()) // Unique token ID
      .sign(JWT_SECRET)

    return token
  }

  static async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload as JWTPayload
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  static async refreshToken(token: string): Promise<string | null> {
    try {
      const payload = await this.verifyToken(token)
      
      // Don't refresh if token is not close to expiration
      const timeUntilExp = payload.exp - Math.floor(Date.now() / 1000)
      if (timeUntilExp > 5 * 60) { // More than 5 minutes until expiration
        return null
      }

      // Create new token with same payload but new expiration
      const newToken = await this.createToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      })

      return newToken
    } catch (error) {
      return null
    }
  }

  static getTokenFromRequest(req: NextRequest): string | null {
    // Try to get token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7)
    }

    // Try to get token from cookie in the request
    const cookieValue = req.cookies.get(AUTH_COOKIE_NAME)?.value
    if (cookieValue) {
      return cookieValue
    }

    return null
  }

  static getTokenFromCookie(): string | null {
    // This function works in client-side code
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const cookie = cookies.find(c => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`))
      if (cookie) {
        return cookie.split('=')[1]
      }
    }
    return null
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= exp
    } catch {
      return true
    }
  }
} 