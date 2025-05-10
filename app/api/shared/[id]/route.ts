import { getPostByShared } from "@/lib/actions"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Extract the [id] param from the URL
        const { searchParams } = new URL(request.url)
        const id = request.nextUrl.pathname.split("/").pop()

        if (!id) {
            return NextResponse.json({ success: false, message: "Missing id parameter" }, { status: 400 })
        }

        const post = await getPostByShared(id)

        return NextResponse.json({ success: true, post }, { status: 200 })
    } catch (error) {
        console.error("Error getting posts:", error)
        return NextResponse.json({ success: false, message: "Failed to get posts" }, { status: 500 })
    }
}