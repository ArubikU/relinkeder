import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = (await cookies()).get("session_token")?.value

    if (sessionToken) {
      // Delete session from database
      await db.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
    }

    // Clear session cookie
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Set-Cookie": `session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
        },
      },
    )
  } catch (error) {
    console.error("Error logging out:", error)
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}
