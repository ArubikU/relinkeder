import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Types
export interface User {
  id: number
  name: string
  email: string
  career?: string
  interests?: string
  ideals?: string
  lang?: string
}

// Generate a random token
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex")
}

// Hash a password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

// Create a session
export async function createSession(userId: number) {
  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  await db.query("INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)", [
    userId,
    token,
    expiresAt,
  ])
  const cook = await cookies()
  cook.set({
    name: "session_token",
    value: token,
    httpOnly: true,
    path: "/",
    expires: expiresAt,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return token
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const sessionToken = (await cookies()).get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  // Get session
  const sessions = await db.query("SELECT * FROM sessions WHERE session_token = $1 AND expires_at > NOW()", [
    sessionToken,
  ])

  if (!sessions.length) {
    return null
  }

  // Get user
  const users = await db.query("SELECT id, name, email, career, interests, ideals FROM users WHERE id = $1", [
    sessions[0].user_id,
  ])

  if (!users.length) {
    return null
  }

  return users[0] as User
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

// Logout
export async function logout() {
  const sessionToken = (await cookies()).get("session_token")?.value

  if (sessionToken) {
    await db.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
  }

  (await cookies()).delete("session_token")
}
