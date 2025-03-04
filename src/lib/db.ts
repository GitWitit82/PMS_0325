import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Prisma client instance with connection pooling in development
 */
export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
} 