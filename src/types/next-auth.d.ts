import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      email: string
      name: string | null
      image: string | null
    }
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
    email: string
    name: string | null
    image: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    email: string
    name: string | null
    image: string | null
  }
} 