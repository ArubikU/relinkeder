import { createSession, verifyPassword } from "@/lib/auth"
import { db } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt with email:", email)

    // Get user
    const users = await db.query("SELECT id, password_hash FROM users WHERE email = $1", [email])

    if (!users.length) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, users[0].password_hash)

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const sessionToken = await createSession(users[0].id)

    // Return success with session token

    const r =  NextResponse.json(
      { success: true, userId: users[0].id },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session_token=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`,
        },
      },
    )
    console.log("Login successful:", r)
    return r
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
