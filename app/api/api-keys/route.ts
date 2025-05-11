import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión de Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

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
    // Obtener la sesión de Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

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
