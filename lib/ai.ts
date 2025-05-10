import { db } from "@/lib/db"
import crypto from "crypto"
import { revalidatePath } from "next/cache"
import { scrapeUrl } from "./scraper"
import { langToFormated } from "./utils"

// Types
export type AIProvider = "cohere" | "openai" | "mistral" | "deepseek" | "gemini"
export type PostSchema = "informative" | "experience" | "curiosity" | "default" | "long-informative" | "long-experience" | "long-curiosity"

export interface AIModel {
  id: string
  provider: AIProvider
  name: string
  description: string
  capabilities: string[]
}

export interface PostSchemaTemplate {
  id: PostSchema
  name: string
  description: string
}

// Post schema templates
export const POST_SCHEMAS: PostSchemaTemplate[] = [
  {
    id: "informative",
    name: "Informative",
    description: "Educational content that shares knowledge, insights, and industry trends",
  },
  {
    id: "experience",
    name: "Experience",
    description: "Personal stories, lessons learned, and professional experiences",
  },
  {
    id: "curiosity",
    name: "Curiosity",
    description: "Thought-provoking questions, polls, and conversation starters",
  },
  {
    id: "default",
    name: "Default",
    description: "Balanced content with a mix of information and engagement",
  },
  {
    id: "long-informative",
    name: "Long Informative",
    description: "In-depth educational content with detailed analysis, data, and actionable insights",
  },
  {
    id: "long-experience",
    name: "Long Experience",
    description: "Extended personal stories or case studies with comprehensive lessons and reflections",
  },
  {
    id: "long-curiosity",
    name: "Long Curiosity",
    description: "Deep-dive questions, explorations, or debates to spark extended discussion and engagement",
  },
]

// Available AI models
export const AI_MODELS: AIModel[] = [
  // Cohere
  {
    id: "cohere-command",
    provider: "cohere",
    name: "Command",
    description: "Powerful general-purpose model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  {
    id: "cohere-command-light",
    provider: "cohere",
    name: "Command Light",
    description: "Faster, more efficient model",
    capabilities: ["text-generation"],
  },
  {
    id: "cohere-command-r",
    provider: "cohere",
    name: "Command R",
    description: "Enhanced reasoning capabilities",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  {
    id: "cohere-command-r-plus",
    provider: "cohere",
    name: "Command R+",
    description: "Most advanced reasoning model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  // OpenAI
  {
    id: "openai-gpt-3.5-turbo",
    provider: "openai",
    name: "GPT-3.5 Turbo",
    description: "Fast and cost-effective model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  {
    id: "openai-gpt-4",
    provider: "openai",
    name: "GPT-4",
    description: "Advanced reasoning and understanding",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  // Mistral
  {
    id: "mistral-7b",
    provider: "mistral",
    name: "Mistral 7B",
    description: "Efficient open-source model",
    capabilities: ["text-generation"],
  },
  {
    id: "mistral-8x7b",
    provider: "mistral",
    name: "Mixtral 8x7B",
    description: "Powerful mixture-of-experts model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  // DeepSeek
  {
    id: "deepseek-chat",
    provider: "deepseek",
    name: "DeepSeek Chat",
    description: "Clasical chat model",
    capabilities: ["text-generation"],
  },
  // Gemini (Google)
  {
    id: "gemini-gemini-2.5-flash-preview-04-17",
    provider: "gemini",
    name: "Gemini 2.5 Flash Preview 04-17",
    description: "Adaptive thinking and cost efficiency. Audio, images, videos, and text input.",
    capabilities: ["text-generation", "multimodal"],
  },
  {
    id: "gemini-gemini-2.5-pro-preview-05-06",
    provider: "gemini",
    name: "Gemini 2.5 Pro Preview 05-06",
    description: "Enhanced reasoning, multimodal understanding, advanced programming.",
    capabilities: ["text-generation", "multimodal", "reasoning"],
  },
  {
    id: "gemini-gemini-2.0-flash",
    provider: "gemini",
    name: "Gemini 2.0 Flash",
    description: "Next-gen features, speed, real-time streaming.",
    capabilities: ["text-generation", "multimodal", "streaming"],
  },
  {
    id: "gemini-gemini-2.0-flash-lite",
    provider: "gemini",
    name: "Gemini 2.0 Flash-Lite",
    description: "Cost efficiency and low latency.",
    capabilities: ["text-generation", "multimodal"],
  },
  {
    id: "gemini-gemini-1.5-flash",
    provider: "gemini",
    name: "Gemini 1.5 Flash",
    description: "Fast, versatile performance for a wide range of tasks.",
    capabilities: ["text-generation", "multimodal"],
  },
  {
    id: "gemini-gemini-1.5-flash-8b",
    provider: "gemini",
    name: "Gemini 1.5 Flash-8B",
    description: "High-volume, lower-intelligence tasks.",
    capabilities: ["text-generation", "multimodal"],
  },
  {
    id: "gemini-gemini-1.5-pro",
    provider: "gemini",
    name: "Gemini 1.5 Pro",
    description: "Complex reasoning tasks requiring more intelligence.",
    capabilities: ["text-generation", "multimodal", "reasoning"],
  },
  // Legacy Gemini for backward compatibility
  {
    id: "gemini-gemini-pro",
    provider: "gemini",
    name: "Gemini Pro",
    description: "Google's advanced general-purpose model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
]

// Get user's API key for a provider
async function getUserApiKey(userId: number, provider: AIProvider): Promise<string | null> {
  const result = await db.query("SELECT key_value FROM api_keys WHERE user_id = $1 AND provider = $2", [
    userId,
    provider,
  ])

  if (result.length === 0) {
    return null
  }

  return result[0].key_value
}

// Generate text with Cohere
async function generateWithCohere(
  prompt: string,
  apiKey: string,
  model = "command",
  temperature = 0.7,
  tokens = 2048,
): Promise<string> {
  const modelName = model.replace("cohere-", "")

  const response = await fetch("https://api.cohere.ai/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: modelName,
      max_tokens: tokens,
      temperature,
      return_likelihoods: "NONE",
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Cohere API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.generations[0].text
}

// Generate text with OpenAI
async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  model = "gpt-3.5-turbo",
  temperature = 0.7,
  tokens = 2048,
): Promise<string> {
  const modelName = model.replace("openai-", "")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate text with Mistral
async function generateWithMistral(
  prompt: string,
  apiKey: string,
  model = "mistral-7b-instruct",
  temperature = 0.7,
  tokens = 2048,
): Promise<string> {
  const modelName = model.replace("mistral-", "")

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Mistral API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate text with DeepSeek
async function generateWithDeepSeek(
  prompt: string,
  apiKey: string,
  model = "deepseek-coder",
  temperature = 0.7,
  tokens = 2048,
): Promise<string> {
  const modelName = model.replace("deepseek-", "")

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`DeepSeek API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate text with Gemini
async function generateWithGemini(
  prompt: string,
  apiKey: string,
  model = "gemini",
  temperature = 0.7,
  tokens = 2048,
): Promise<string> {
  const response = await fetch("https://api.gemini.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate text with any provider
async function generateText(userId: number, prompt: string, modelId: string, temperature = 0.7, tokens = 2048): Promise<string> {
  const model = AI_MODELS.find((m) => m.id === modelId)

  if (!model) {
    throw new Error(`Model ${modelId} not found`)
  }

  const apiKey = await getUserApiKey(userId, model.provider)

  if (!apiKey) {
    throw new Error(`No API key found for ${model.provider}`)
  }

  switch (model.provider) {
    case "cohere":
      return generateWithCohere(prompt, apiKey, model.id, temperature,tokens)
    case "openai":
      return generateWithOpenAI(prompt, apiKey, model.id, temperature,tokens)
    case "mistral":
      return generateWithMistral(prompt, apiKey, model.id, temperature,tokens)
    case "deepseek":
      return generateWithDeepSeek(prompt, apiKey, model.id, temperature,tokens)
    case "gemini":
      return generateWithGemini(prompt, apiKey, model.id, temperature,tokens)
    default:
      throw new Error(`Provider ${model.provider} not supported`)
  }
}

// Process reference links to get content
async function processReferenceLinks(links: string[]): Promise<string> {
  if (links.length === 0) {
    return ""
  }

  const contentSummaries = []

  for (const url of links) {
    try {
      // Check if we already have scraped this URL
      const existingContent = await db.query("SELECT title, summary FROM scraped_content WHERE url = $1", [url])

      if (existingContent.length > 0) {
        contentSummaries.push(`
          URL: ${url}
          Title: ${existingContent[0].title || "Unknown"}
          Summary: ${existingContent[0].summary || "No summary available"}
        `)
      } else {
        // Scrape the URL
        const { title, content } = await scrapeUrl(url)

        // Store in database
        await db.query("INSERT INTO scraped_content (url, title, content) VALUES ($1, $2, $3)", [url, title, content])

        contentSummaries.push(`
          URL: ${url}
          Title: ${title || "Unknown"}
          Content: ${content.substring(0, 1000)}${content.length > 1000 ? "..." : ""}
        `)
      }
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error)
      contentSummaries.push(`
        URL: ${url}
        Error: Failed to scrape content
      `)
    }
  }

  return contentSummaries.join("\n\n")
}

// Generate topics using AI
export async function generateTopics(
  userId: number,
  referenceLinks: string[] = [],
  modelId = "cohere-command",
  extraInstructions = "",
): Promise<any[]> {
  try {
    // Get user profile
    const userProfile = await db.query("SELECT * FROM users WHERE id = $1", [userId])

    if (!userProfile.length) {
      throw new Error("User profile not found")
    }

    const user = userProfile[0]

    // Get reference links if not provided
    let links = referenceLinks
    if (links.length === 0) {
      const savedLinks = await db.query("SELECT url FROM reference_links WHERE user_id = $1", [userId])
      links = savedLinks.map((link) => link.url)
    }

    // Process reference links to get content
    const referencesContent = await processReferenceLinks(links)

    // Get previously generated topics to avoid duplicates
    const previousTopics = await db.query("SELECT topic_hash FROM generated_topics WHERE user_id = $1", [userId])
    const previousTopicHashes = new Set(previousTopics.map((t) => t.topic_hash))

    // Generate topics using AI
    const prompt = `
      Generate 5 trending and relevant professional topics for a LinkedIn post.
      The user works in ${user.career || "technology"}.
      Their interests include: ${user.interests || "professional development"}.
      Their professional values include: ${user.ideals || "innovation and growth"}.
      
      ${referencesContent ? `Here is content from reference links that should inform the topics:\n${referencesContent}` : ""}
      
      Follow these extra instructions if provided:
      ${extraInstructions}

      For each topic, provide:
      1. A concise title (5-7 words)
      2. A brief description (1-2 sentences)


      The title and description language should be on ${langToFormated(user.lang || "en")} .
      Format the response as a JSON array with objects containing 'title' and 'description' fields.
      like this:
      Just return the JSON array no other text:
      [
        {
          "title": "Topic 1",
          "description": "Description for topic 1"
        },
        {
          "title": "Topic 2",
          "description": "Description for topic 2"
        }
      ]
    `

    const text = await generateText(userId, prompt, modelId, 0.7)
    const topicsData = JSON.parse(text)

    // Filter out previously generated topics and save new ones
    const savedTopics = []
    for (const topic of topicsData) {
      // Create a hash of the topic title to check for duplicates
      const topicHash = crypto.createHash("md5").update(topic.title.toLowerCase()).digest("hex")

      // Skip if this topic has been generated before
      if (previousTopicHashes.has(topicHash)) {
        continue
      }

      // Save the topic
      const result = await db.query(
        "INSERT INTO topics (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description",
        [userId, topic.title, topic.description],
      )

      // Record that we've generated this topic
      await db.query("INSERT INTO generated_topics (user_id, topic_hash) VALUES ($1, $2)", [userId, topicHash])

      savedTopics.push(result[0])
    }

    revalidatePath("/dashboard")
    return savedTopics
  } catch (error) {
    console.error("Error generating topics:", error)
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error)
    throw new Error(`Failed to generate topics: ${errorMessage}`)
  }
}

// Generate posts for a topic using AI
export async function generatePosts(
  topicId: number,
  userId: number,
  modelId = "cohere-command",
  useChainOfThought = false,
  schema: PostSchema = "default",
  extraInstructions = "",
): Promise<any[]> {
  try {
    // Get the topic
    const topicResult = await db.query("SELECT * FROM topics WHERE id = $1 AND user_id = $2", [topicId, userId])

    if (!topicResult.length) {
      throw new Error("Topic not found or doesn't belong to user")
    }

    const topic = topicResult[0]

    // Get user profile
    const userProfile = await db.query("SELECT * FROM users WHERE id = $1", [userId])

    if (!userProfile.length) {
      throw new Error("User profile not found")
    }

    const user = userProfile[0]

    // Get schema instructions
    let schemaInstructions = ""
    switch (schema) {
      case "informative":
        schemaInstructions = `
          Use an informative tone. Focus on educating the audience with valuable insights, data, and industry knowledge.
          Include facts, statistics, or research findings when relevant.
          Structure the post to clearly communicate key points and takeaways.
          End with a thought-provoking question or call to action for readers to learn more.
        `
        break
      case "long-informative":
        schemaInstructions = `
          Use an informative tone. Focus on educating the audience with valuable insights, data, and industry knowledge.
          Include facts, statistics, or research findings when relevant.
          Structure the post to clearly communicate key points and takeaways.
          End with a thought-provoking question or call to action for readers to learn more.
        `
        break
      case "experience":
        schemaInstructions = `
          Use a personal, storytelling tone. Share experiences, lessons learned, or professional journey insights.
          Start with a compelling hook about a personal challenge or achievement.
          Include specific details that make the story authentic and relatable.
          End with the key lesson or insight gained from the experience.
        `
        break
      case "long-experience":
        schemaInstructions = `
          Use a personal, storytelling tone. Share experiences, lessons learned, or professional journey insights.
          Start with a compelling hook about a personal challenge or achievement.
          Include specific details that make the story authentic and relatable.
          End with the key lesson or insight gained from the experience.
        `
        break
      case "curiosity":
        schemaInstructions = `
          Use a curious, thought-provoking tone. Focus on asking interesting questions or presenting surprising perspectives.
          Start with a thought-provoking question or surprising statement.
          Present information that challenges conventional wisdom or offers a new perspective.
          End by inviting readers to share their thoughts or experiences on the topic.
        `
        break
      case "long-curiosity":
        schemaInstructions = `
          Use a curious, thought-provoking tone. Focus on asking interesting questions or presenting surprising perspectives.
          Start with a thought-provoking question or surprising statement.
          Present information that challenges conventional wisdom or offers a new perspective.
          End by inviting readers to share their thoughts or experiences on the topic.
        `
        break
      default:
        schemaInstructions = `
          Use a balanced, professional tone that combines information with engagement.
          Include both factual information and personal perspective.
          Structure the post to be clear, concise, and engaging.
          End with either a question, call to action, or key takeaway.
        `
    }

    // Generate posts using AI
    let prompt = `
      Generate 5 engaging LinkedIn posts about "${topic.title}".
      The user works in ${user.career || "technology"}.
      Their interests include: ${user.interests || "professional development"}.
      Their professional values include: ${user.ideals || "innovation and growth"}.
      
      ${schemaInstructions}
      
      For each post:
      1. Make it professional and engaging
      2. Include relevant hashtags
      3. Keep it between 150-600 words
      4. Make it sound authentic and personal
      5. Include a suggested image description that could be used to search for or generate an image with AI
      
      Follow these extra instructions if provided:
      ${extraInstructions}

      DO NOT include the image suggestion in the post content.
      The content language should be on ${langToFormated(user.lang || "en")} .
      Format the response as a JSON array with objects containing:
      - 'content': The final LinkedIn post
      - 'image_suggestion': A brief description of an image that would complement the post
      like this:
      Just return the JSON array no other text:
      [
        {
          "content": "Post 1 content",
          "reasoning": "Post 1 reasoning",
          "image_suggestion": "Post 1 image suggestion"
        },
        {
          "content": "Post 2 content",
          "reasoning": "Post 2 reasoning",
          "image_suggestion": "Post 2 image suggestion"
        }
      ]
    `

    let chainOfThoughts: string[] = []

    if (useChainOfThought) {
      // Step 1: Generate chain-of-thought reasoning for each post
      const cotPrompt = `
      For the topic "${topic.title}", the user works in ${user.career || "technology"}.
      Their interests include: ${user.interests || "professional development"}.
      Their professional values include: ${user.ideals || "innovation and growth"}.

      ${schemaInstructions}

      Generate a step-by-step chain-of-thought reasoning for creating 5 engaging LinkedIn posts about this topic.
      For each, consider:
      1. The target audience for the post
      2. What aspects of the topic are most relevant to the user's field
      3. How to frame the topic to align with the user's professional values
      4. The structure: hook, main points, call to action
      5. What hashtags would increase visibility
      6. What kind of image would complement the post

      Format the response as a JSON array of 5 objects, each with a 'reasoning' field.
      Just return the JSON array, no other text:
      [
        { "reasoning": "Step-by-step reasoning for post 1" },
        { "reasoning": "Step-by-step reasoning for post 2" },
        { "reasoning": "Step-by-step reasoning for post 3" },
        { "reasoning": "Step-by-step reasoning for post 4" },
        { "reasoning": "Step-by-step reasoning for post 5" }
      ]
      `
      const cotText = await generateText(userId, cotPrompt, modelId, 0.7, 2048)
      const cotData = JSON.parse(cotText)
      chainOfThoughts = cotData.map((item: any) => item.reasoning)

      // Step 2: Generate posts using the chain-of-thoughts
      prompt = `
      Generate 5 engaging LinkedIn posts about "${topic.title}".
      The user works in ${user.career || "technology"}.
      Their interests include: ${user.interests || "professional development"}.
      Their professional values include: ${user.ideals || "innovation and growth"}.

      ${schemaInstructions}

      For each post, use the following chain-of-thought reasoning:
      ${chainOfThoughts.map((cot, idx) => `Post ${idx + 1} reasoning: ${cot}`).join("\n\n")}

      Follow these extra instructions if provided:
      ${extraInstructions}

      For each post:
      1. Make it professional and engaging
      2. Include relevant hashtags
      3. Keep it between 150-360 words
      4. Make it sound authentic and personal
      5. Include a suggested image description that could be used to search for or generate an image with AI

      Format the response as a JSON array with objects containing:
      - 'content': The final LinkedIn post
      - 'reasoning': The step-by-step thought process used (from above)
      - 'image_suggestion': A brief description of an image that would complement the post

      DO NOT include the image suggestion in the post content.
      Return the content and image suggestion in the language ${langToFormated(user.lang || "en")}.
      Just return the JSON array, no other text:
      [
        {
        "content": "Post 1 content",
        "reasoning": "Post 1 reasoning",
        "image_suggestion": "Post 1 image suggestion"
        },
        {
        "content": "Post 2 content",
        "reasoning": "Post 2 reasoning",
        "image_suggestion": "Post 2 image suggestion"
        }
      ]
      `
    }

    const text = await generateText(userId, prompt, modelId, 0.7,2048*4)
    // Parse the response
    const postsData = JSON.parse(text)

    // Generate engagement scores for each post
    const scorePrompt = `
      For each LinkedIn post, predict engagement metrics on a scale of 0.0 to 1.0:
      
      Posts:
      ${postsData.map((post: any, index: number) => `Post ${index + 1}: ${post.content}`).join("\n\n")}
      
      For each post, provide these scores:
      1. engagement_score: Likelihood of getting likes, comments, and shares
      2. attractiveness_score: Visual appeal and readability
      3. interest_score: How interesting the content is
      4. relevance_score: Relevance to professional audience
      5. shareability_score: Likelihood of being shared
      6. professional_score: Level of professionalism
      
      Format the response as a JSON array with objects containing all score fields.
      like this:
      Just return the JSON array no other text:
      [
        {
          "engagement_score": 0.8,
          "attractiveness_score": 0.7,
          "interest_score": 0.9,
          "relevance_score": 0.85,
          "shareability_score": 0.75,
          "professional_score": 0.9
        },
        {
          "engagement_score": 0.6,
          "attractiveness_score": 0.5,
          "interest_score": 0.7,
          "relevance_score": 0.65,
          "shareability_score": 0.55,
          "professional_score": 0.6
        }
      ]
    `

    const scoresText = await generateText(userId, scorePrompt, modelId, 0.3)

    // Parse the scores
    const scoresData = JSON.parse(scoresText)

    // Save posts to database
    const savedPosts = []
    for (let i = 0; i < postsData.length; i++) {
      const post = postsData[i]
      const scores = scoresData[i]

      // Fallback values for scores if missing or invalid
      const engagement_score = typeof scores.engagement_score === "number" ? scores.engagement_score : 0.5
      const attractiveness_score = typeof scores.attractiveness_score === "number" ? scores.attractiveness_score : 0.5
      const interest_score = typeof scores.interest_score === "number" ? scores.interest_score : 0.5
      const relevance_score = typeof scores.relevance_score === "number" ? scores.relevance_score : 0.5
      const shareability_score = typeof scores.shareability_score === "number" ? scores.shareability_score : 0.5
      const professional_score = typeof scores.professional_score === "number" ? scores.professional_score : 0.5

      const result = await db.query(
        `INSERT INTO posts (
          user_id, 
          topic_id, 
          content, 
          engagement_score, 
          attractiveness_score, 
          interest_score, 
          relevance_score, 
          shareability_score, 
          professional_score,
          reasoning,
          model_used,
          image_suggestion,
          schema_used
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          userId,
          topicId,
          post.content,
          engagement_score,
          attractiveness_score,
          interest_score,
          relevance_score,
          shareability_score,
          professional_score,
          post.reasoning || null,
          modelId,
          post.image_suggestion || null,
          schema,
        ],
      )
      savedPosts.push(result[0])
    }

    revalidatePath("/dashboard")
    return savedPosts
  } catch (error) {
    console.error("Error generating posts:", error)
    const errorMessage = typeof error === "object" && error !== null && "message" in error
      ? (error as { message: string }).message
      : String(error)
    throw new Error(`Failed to generate posts: ${errorMessage}`)
  }
}
