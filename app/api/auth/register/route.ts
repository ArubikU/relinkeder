import { db } from "@/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
try{
    const user = await auth()
  if (!user.userId) {
    return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
  }
  const duser = await currentUser()
  const first_name = duser?.fullName || duser?.firstName || duser?.lastName || duser?.emailAddresses[0].emailAddress.split("@")[0] || ""
  const primaryEmail = duser?.emailAddresses[0].emailAddress || ""
  const id = user?.userId || ""
    try {
      // Crear usuario en la base de datos
      await db.query(
        "INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
        [id, primaryEmail, first_name]
      );

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error creando usuario en DB:', error);
      return NextResponse.json({ success: false, error: 'Error creando usuario en la base de datos' }, { status: 500 });
    }
}
catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Error al crear usuario" }, { status: 500 })
  }
}
