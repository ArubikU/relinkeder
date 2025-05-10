"use server"

import {
  AI_MODELS,
  generatePosts as aiGeneratePosts,
  generateTopics as aiGenerateTopics,
  POST_SCHEMAS,
  type AIProvider,
  type PostSchema,
} from "@/lib/ai"
import { logout as authLogout, createSession, getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Register a new user
export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Check if user already exists
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.length > 0) {
      return { success: false, message: "Email already in use" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await db.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id", [
      name,
      email,
      hashedPassword,
    ])

    // Create session
    await createSession(newUser[0].id)

    revalidatePath("/")
    return { success: true, userId: newUser[0].id }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Registration failed" }
  }
}

// Login
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Get user
    const users = await db.query("SELECT id, password_hash FROM users WHERE email = $1", [email])

    if (!users.length) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isValid = await verifyPassword(password, users[0].password_hash)

    if (!isValid) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create session
    await createSession(users[0].id)

    revalidatePath("/")
    return { success: true, userId: users[0].id }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, message: "Login failed" }
  }
}

// Logout
export async function logout() {
  await authLogout()
  revalidatePath("/")
  redirect("/")
}

// Save user profile
export async function saveUserProfile(formData: FormData) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, message: "Not authenticated" }
  }

  const name = formData.get("name") as string
  const career = formData.get("career") as string
  const interests = formData.get("interests") as string
  const ideals = formData.get("ideals") as string

  try {
    // Update user
    await db.query("UPDATE users SET name = $1, career = $2, interests = $3, ideals = $4 WHERE id = $5", [
      name,
      career,
      interests,
      ideals,
      currentUser.id,
    ])

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error saving user profile:", error)
    return { success: false, message: "Failed to save profile" }
  }
}

// Save API keys
export async function saveApiKeys(formData: FormData) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, message: "Not authenticated" }
  }

  try {
    // Process each provider
    const providers: AIProvider[] = ["cohere", "openai", "mistral", "deepseek"]

    for (const provider of providers) {
      const apiKey = formData.get(`${provider}_api_key`) as string

      if (apiKey) {
        await db.query(
          `INSERT INTO api_keys (user_id, provider, key_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, provider) 
           DO UPDATE SET key_value = $3`,
          [currentUser.id, provider, apiKey],
        )
      }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error saving API keys:", error)
    return { success: false, message: "Failed to save API keys" }
  }
}

// Get user's API keys
export async function getUserApiKeys() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return {}
  }

  try {
    const apiKeys = await db.query("SELECT provider, key_value FROM api_keys WHERE user_id = $1", [currentUser.id])

    const result: Record<string, string> = {}

    for (const key of apiKeys) {
      result[key.provider] = key.key_value
    }

    return result
  } catch (error) {
    console.error("Error getting API keys:", error)
    return {}
  }
}

// Save reference links
export async function saveReferenceLinks(links: string[]) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, message: "Not authenticated" }
  }

  try {
    // Delete existing links
    await db.query("DELETE FROM reference_links WHERE user_id = $1", [currentUser.id])

    // Save new links
    for (const url of links) {
      await db.query("INSERT INTO reference_links (user_id, url) VALUES ($1, $2)", [currentUser.id, url])
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving reference links:", error)
    return { success: false, message: "Failed to save reference links" }
  }
}

// Generate topics
export async function generateTopics(referenceLinks: string[] = [], modelId = "cohere-command") {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return []
  }

  return aiGenerateTopics(currentUser.id, referenceLinks, modelId)
}

// Generate posts
export async function generatePosts(
  topicId: number,
  modelId = "cohere-command",
  useChainOfThought = false,
  schema: PostSchema = "default",
) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return []
  }

  return aiGeneratePosts(topicId, currentUser.id, modelId, useChainOfThought, schema)
}

// Get available AI models
export async function getAvailableModels() {
  return AI_MODELS
}

// Get available post schemas
export async function getAvailableSchemas() {
  return POST_SCHEMAS
}


export async function sharePost(postId: number, userId: number) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, message: "Not authenticated" }
  }

  try {
    // Check if the post is already shared
    const existingShare = await db.query("SELECT * FROM shares WHERE post_id = $1 AND user_id = $2", [
      postId,
      userId,
    ])

    if (existingShare.length > 0) {
      return {success: true, shareId: existingShare[0].id}
    }

    // Share the post
    await db.query("INSERT INTO shares (post_id, user_id) VALUES ($1, $2)", [postId, userId])
    //get the shares id
    const shares = await db.query("SELECT id FROM shares WHERE post_id = $1 AND user_id = $2", [postId, userId])
    const shareId = shares[0].id
    return { success: true , shareId }
  } catch (error) {
    console.error("Error sharing post:", error)
    return { success: false, message: "Failed to share post" }
  }
}

export async function getPostByShared(shareId: string) {

  try {
    // Get the post by share id
    const posts = await db.query("SELECT * FROM posts WHERE id = (SELECT post_id FROM shares WHERE id = $1)", [
      shareId,
    ])

    if (posts.length === 0) {
      return { success: false, message: "Post not found" }
    }

    return { success: true, post: posts[0] }
  } catch (error) {
    console.error("Error getting post by share id:", error)
    return { success: false, message: "Failed to get post by share id" }
  }
}