import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = (await cookies()).get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get user from session
    const sessions = await db.query("SELECT user_id FROM sessions WHERE session_token = $1", [sessionToken])

    if (!sessions.length) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Get user data
    const users = await db.query("SELECT id, name, email, career, interests, ideals, lang FROM users WHERE id = $1", [userId])

    if (!users.length) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }
    console.log(users[0])
    console.log("AAA")
    return NextResponse.json({ success: true, user: users[0] }, { status: 200 })
  } catch (error) {
    console.error("Error getting user profile:", error)
    return NextResponse.json({ success: false, message: "Failed to get user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = (await cookies()).get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    // Get user from session
    const sessions = await db.query("SELECT user_id FROM sessions WHERE session_token = $1", [sessionToken])

    if (!sessions.length) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Get request body
    const { name, career, interests, ideals, lang } = await request.json()
    
    // Update user
    await db.query("UPDATE users SET name = $1, career = $2, interests = $3, ideals = $4, lang = $5 WHERE id = $6", [
      name,
      career,
      interests,
      ideals,
      lang,
      userId,
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update user profile" }, { status: 500 })
  }
}
