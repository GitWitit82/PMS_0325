import { randomBytes } from "crypto"

/**
 * Generates a random token for password reset
 * @returns {string} A random token
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex")
} 