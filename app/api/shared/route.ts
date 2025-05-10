import { sharePost } from "@/lib/actions"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const {postId} = await request.json()
    if (!postId) {
      return NextResponse.json({ success: false, message: "Post ID is required" }, { status: 400 })
    }
    const sharedPostN = await sharePost(postId,userId)
    if (!sharedPostN) {
      return NextResponse.json({ success: false, message: "Failed to share post" }, { status: 500 })
    }


    return NextResponse.json({ success: true, shareId: sharedPostN.shareId }, { status: 200 })
  } catch (error) {
    console.error("Error generating posts:", error)
    return NextResponse.json({ success: false, message: "Failed to generate posts" }, { status: 500 })
  }
}