import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession, hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id", [
      name,
      email,
      hashedPassword,
    ])

    // Create session
    const sessionToken = await createSession(newUser[0].id)

    // Return success with session token
    return NextResponse.json(
      { success: true, userId: newUser[0].id },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
        },
      },
    )
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
