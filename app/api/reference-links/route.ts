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

    // Get reference links
    const links = await db.query("SELECT url FROM reference_links WHERE user_id = $1", [userId])

    return NextResponse.json({ success: true, links: links.map((link) => link.url) }, { status: 200 })
  } catch (error) {
    console.error("Error getting reference links:", error)
    return NextResponse.json({ success: false, message: "Failed to get reference links" }, { status: 500 })
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
    const { links } = await request.json()

    // Delete existing links
    await db.query("DELETE FROM reference_links WHERE user_id = $1", [userId])

    // Save new links
    for (const url of links) {
      await db.query("INSERT INTO reference_links (user_id, url) VALUES ($1, $2)", [userId, url])
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error saving reference links:", error)
    return NextResponse.json({ success: false, message: "Failed to save reference links" }, { status: 500 })
  }
}
