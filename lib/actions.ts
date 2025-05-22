"use server"

import {
  AI_MODELS,
  generatePosts as aiGeneratePosts,
  generateTopics as aiGenerateTopics,
  POST_SCHEMAS,
  type AIProvider,
  type PostSchema,
} from "@/lib/ai"
import { db } from "@/lib/db"
import { User } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// All functions now receive userId as an argument

export async function getUserData(userId: string, user?: User) {

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    )
    let rUser = result.length > 0 ? result[0] : null

    if (!rUser) {
      const first_name = user?.fullName || user?.firstName || user?.lastName || user?.emailAddresses[0].emailAddress.split("@")[0] || ""
      const primaryEmail = user?.emailAddresses[0].emailAddress || ""
      const id = user?.id || ""
      try {
        // Create user in the database
        await db.query(
          "INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
          [id, primaryEmail, first_name]
        )
        // Fetch the user again to get the complete data
        const newUser = await db.query(
          "SELECT * FROM users WHERE id = $1",
          [id]
        )
        rUser = newUser.length > 0 ? newUser[0] : null
      } catch (error) {
        console.error("Error creating user in DB:", error)
        return null
      }
    }
    return rUser;
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}
// Save user profile
export async function saveUserProfile(userId: string, formData: { career: string, interests: string, ideals: string, lang: string }) {
  if (!userId) return { success: false, message: "Not authenticated" }

  const { career, interests, ideals, lang } = formData

  try {
    await db.query(
      `INSERT INTO users (id, career, interests, ideals, lang)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
       SET career = $2, interests = $3, ideals = $4, lang = $5`,
      [userId, career, interests, ideals, lang]
    )
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error saving profile:", error)
    return { success: false, message: "Failed to save profile" }
  }
}

// Save API keys
export async function saveApiKeys(userId: string, formData: FormData) {
  if (!userId) return { success: false, message: "Not authenticated" }

  const providers: AIProvider[] = ["cohere", "openai", "mistral", "deepseek"]
  try {
    for (const provider of providers) {
      const apiKey = formData.get(`${provider}_api_key`) as string
      if (apiKey) {
        await db.query(
          `INSERT INTO api_keys (user_id, provider, key_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, provider) DO UPDATE SET key_value = $3`,
          [userId, provider, apiKey]
        )
      }
    }
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error saving API keys:", error)
    return { success: false, message: "Failed to save API keys" }
  }
}

// Get API keys
export async function getUserApiKeys(userId: string) {
  if (!userId) return {}

  try {
    const apiKeys = await db.query("SELECT provider, key_value FROM api_keys WHERE user_id = $1", [userId])
    const result: Record<string, string> = {}
    for (const key of apiKeys) result[key.provider] = key.key_value
    return result
  } catch (error) {
    console.error("Error getting API keys:", error)
    return {}
  }
}

// Save reference links
export async function saveReferenceLinks(userId: string, links: string[]) {
  if (!userId) return { success: false, message: "Not authenticated" }

  try {
    await db.query("DELETE FROM reference_links WHERE user_id = $1", [userId])
    for (const url of links) {
      await db.query("INSERT INTO reference_links (user_id, url) VALUES ($1, $2)", [userId, url])
    }
    return { success: true }
  } catch (error) {
    console.error("Error saving reference links:", error)
    return { success: false, message: "Failed to save reference links" }
  }
}

// Generate topics
export async function generateTopics(userId: string, referenceLinks: string[] = [], modelId = "cohere-command") {
  if (!userId) return []
  return aiGenerateTopics(userId, referenceLinks, modelId)
}

// Generate posts
export async function generatePosts(
  userId: string,
  topicId: number,
  modelId = "cohere-command",
  useChainOfThought = false,
  schema: PostSchema = "default"
) {
  if (!userId) return []
  return aiGeneratePosts(topicId, userId, modelId, useChainOfThought, schema)
}

// Get models and schemas
export async function getAvailableModels() {
  return AI_MODELS
}
export async function getAvailableSchemas() {
  return POST_SCHEMAS
}

// Share a post with another user
export async function sharePost(userId: string, postId: number) {
  if (!userId) return { success: false, message: "Not authenticated" }

  try {
    const existingShare = await db.query(
      "SELECT id FROM shares WHERE post_id = $1 AND user_id = $2",
      [postId, userId]
    )
    if (existingShare.length > 0) {
      return { success: true, shareId: existingShare[0].id }
    }

    await db.query("INSERT INTO shares (post_id, user_id) VALUES ($1, $2)", [postId, userId])
    const shares = await db.query("SELECT id FROM shares WHERE post_id = $1 AND user_id = $2", [
      postId,
      userId,
    ])
    return { success: true, shareId: shares[0].id }
  } catch (error) {
    console.error("Error sharing post:", error)
    return { success: false, message: "Failed to share post" }
  }
}

// Get a post from share ID
export async function getPostByShared(shareId: string) {
  try {
    const posts = await db.query(
      "SELECT * FROM posts WHERE id = (SELECT post_id FROM shares WHERE id = $1)",
      [shareId]
    )
    if (posts.length === 0) return { success: false, message: "Post not found" }
    return { success: true, post: posts[0] }
  } catch (error) {
    console.error("Error getting post by share id:", error)
    return { success: false, message: "Failed to get post" }
  }
}
