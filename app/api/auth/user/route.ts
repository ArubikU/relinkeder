import { getUserData } from "@/lib/actions"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión de Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Obtener datos del usuario usando la función del servidor
    const userData = await getUserData(userId)

    if (!userData) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: userData }, { status: 200 })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ success: false, message: "Error al obtener usuario" }, { status: 500 })
  }
}
