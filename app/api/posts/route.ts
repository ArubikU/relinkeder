import type { PostSchema } from "@/lib/ai"
import { generatePosts } from "@/lib/ai"
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

    // Get topic ID from query params
    const topicId = request.nextUrl.searchParams.get("topicId")
    let posts: any[] = []
    if (!topicId) {
    posts = await db.query("SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    }
    else{
    // Get posts
     posts = await db.query("SELECT * FROM posts WHERE user_id = $1 AND topic_id = $2 ORDER BY created_at DESC", [userId, topicId])
    }

    return NextResponse.json({ success: true, posts }, { status: 200 })
  } catch (error) {
    console.error("Error getting posts:", error)
    return NextResponse.json({ success: false, message: "Failed to get posts" }, { status: 500 })
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
    const { topicId, modelId, useChainOfThought, schema, extraInstructions } = await request.json()

    // Generate posts
    const posts = await generatePosts(topicId, userId, modelId, useChainOfThought, schema as PostSchema, extraInstructions)

    return NextResponse.json({ success: true, posts }, { status: 200 })
  } catch (error) {
    console.error("Error generating posts:", error)
    return NextResponse.json({ success: false, message: "Failed to generate posts" }, { status: 500 })
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
    const { postId } = await request.json()

    // Delete post
    await db.query("DELETE FROM posts WHERE id = $1 AND user_id = $2", [postId, userId])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ success: false, message: "Failed to delete post" }, { status: 500 })
  }
}