import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { randomBytes } from "crypto"
import { sendEmail } from "@/lib/email"

const requestSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = requestSchema.parse(body)

    // Generate reset token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Update or create verification token
    await prisma.verificationToken.upsert({
      where: { identifier: email },
      update: {
        token,
        expires,
      },
      create: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${token}`
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    })

    return NextResponse.json(
      { message: "Reset email sent successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset request error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: "Failed to process reset request" },
      { status: 500 }
    )
  }
} 