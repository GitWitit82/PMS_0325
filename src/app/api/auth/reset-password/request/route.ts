import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/token"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      )
    }

    const token = generateToken()
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Update or create verification token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
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

    // TODO: Send email with reset link

    return NextResponse.json(
      { message: "Password reset link sent to your email" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password request error:", error)
    return NextResponse.json(
      { error: "Failed to process reset password request" },
      { status: 500 }
    )
  }
} 