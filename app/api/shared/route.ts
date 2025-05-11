import { sharePost } from "@/lib/actions"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión de Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    const {postId} = await request.json()
    if (!postId) {
      return NextResponse.json({ success: false, message: "Post ID is required" }, { status: 400 })
    }
    const sharedPostN = await sharePost(userId, postId)
    if (!sharedPostN) {
      return NextResponse.json({ success: false, message: "Failed to share post" }, { status: 500 })
    }


    return NextResponse.json({ success: true, shareId: sharedPostN.shareId }, { status: 200 })
  } catch (error) {
    console.error("Error generating posts:", error)
    return NextResponse.json({ success: false, message: "Failed to generate posts" }, { status: 500 })
  }
}