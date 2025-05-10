import { generateTopics } from "@/lib/ai"
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
    const sessions = await db.query("SELECT user_id FROM sessions WHERE session_token = $1 ORDER BY created_at DESC", [sessionToken])

    if (!sessions.length) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const userId = sessions[0].user_id

    // Get topics
    const topics = await db.query("SELECT id, title, description FROM topics WHERE user_id = $1 ORDER BY created_at DESC", [userId])

    return NextResponse.json({ success: true, topics }, { status: 200 })
  } catch (error) {
    console.error("Error getting topics:", error)
    return NextResponse.json({ success: false, message: "Failed to get topics" }, { status: 500 })
  }
}

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

    // Get request body
    const { referenceLinks, modelId, extraInstructions } = await request.json()

    // Generate topics
    const topics = await generateTopics(userId, referenceLinks, modelId, extraInstructions)

    return NextResponse.json({ success: true, topics }, { status: 200 })
  } catch (error) {
    console.error("Error generating topics:", error)
    return NextResponse.json({ success: false, message: "Failed to generate topics" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const { topicId } = await request.json()

    // Delete topic
    const a = await db.query("DELETE FROM topics WHERE id = $1 AND user_id = $2", [topicId, userId])
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting topic:", error)
    return NextResponse.json({ success: false, message: "Failed to delete topic" }, { status: 500 })
  }
}