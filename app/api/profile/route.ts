import { getUserData, saveUserProfile } from "@/lib/actions"
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
    console.error("Error getting user profile:", error)
    return NextResponse.json({ success: false, message: "Error al obtener perfil de usuario" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión de Clerk
    const { userId } = await auth()
    

    if (!userId) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Obtener los datos del formulario
    const { career, interests, ideals, lang } = await request.json()
    const formData = {
      career,
      interests,
      ideals,
      lang
    }

    

    // Usar la función de servidor para guardar el perfil
    const result = await saveUserProfile(userId, formData)
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        message: result.message || "Error al guardar el perfil" 
      }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error saving profile:", error)
    return NextResponse.json({ success: false, message: "Error al guardar el perfil" }, { status: 500 })
  }
}
