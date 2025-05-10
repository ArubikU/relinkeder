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

    // Get API keys
    const apiKeys = await db.query("SELECT provider, key_value FROM api_keys WHERE user_id = $1", [userId])

    const result: Record<string, string> = {}

    for (const key of apiKeys) {
      result[key.provider] = key.key_value
    }

    return NextResponse.json({ success: true, apiKeys: result }, { status: 200 })
  } catch (error) {
    console.error("Error getting API keys:", error)
    return NextResponse.json({ success: false, message: "Failed to get API keys" }, { status: 500 })
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
    const apiKeys = await request.json()

    // Save API keys
    for (const [provider, key] of Object.entries(apiKeys)) {
      if (key) {
        await db.query(
          `INSERT INTO api_keys (user_id, provider, key_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, provider) 
           DO UPDATE SET key_value = $3`,
          [userId, provider, key],
        )
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error saving API keys:", error)
    return NextResponse.json({ success: false, message: "Failed to save API keys" }, { status: 500 })
  }
}
