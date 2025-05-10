import { type NextRequest, NextResponse } from "next/server"
import { AI_MODELS, POST_SCHEMAS } from "@/lib/ai"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        models: AI_MODELS,
        schemas: POST_SCHEMAS,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error getting models:", error)
    return NextResponse.json({ success: false, message: "Failed to get models" }, { status: 500 })
  }
}
