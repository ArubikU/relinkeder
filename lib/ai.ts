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
function sanitizeJSONString(jsonString: string): string {
  // Esta expresión busca todo string JSON (entre comillas dobles)
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim()
      }
  return jsonString.replace(/"(?:\\.|[^"\\])*"/g, (match) => {
    return match.replace(/[\u0000-\u001F]/g, (char) => {
      const code = char.charCodeAt(0).toString(16).padStart(4, '0');
      return `\\u${code}`;
    });
  });
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
    id: "cohere-command-r-plus",
    provider: "cohere",
    name: "Command R+",
    description: "Most advanced reasoning model",
    capabilities: ["text-generation", "chain-of-thought"],
  },
  {
    id: "command-a-03-2025",
    provider: "cohere",
    name: "Command A 03-2025",
    description: "Advanced reasoning and multimodal capabilities",
    capabilities: ["text-generation", "chain-of-thought", "multimodal", "chatty"],
  },
  {
    id: "command-r7b-12-2024",
    provider: "cohere",
    name: "Command R7B",
    description: "Smaller, faster model with advanced reasoning",
    capabilities: ["text-generation", "chain-of-thought"],
  },
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
async function getUserApiKey(userId: string, provider: AIProvider): Promise<string | null> {
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

  const isChatty = AI_MODELS.find((m) => m.id === model)?.capabilities.includes("chatty")
  if (isChatty) {
    const response = await fetch("https://api.cohere.ai/v2/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        temperature,
        model: modelName,
        max_tokens: tokens,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Cohere API error: ${error.message || response.statusText}`)
    }

    const data = await response.json()
    return data.message.content[0].text
  }

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
async function generateText(userId: string, prompt: string, modelId: string, temperature = 0.7, tokens = 2048): Promise<string> {
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
      return generateWithCohere(prompt, apiKey, model.id, temperature, tokens)
    case "openai":
      return generateWithOpenAI(prompt, apiKey, model.id, temperature, tokens)
    case "mistral":
      return generateWithMistral(prompt, apiKey, model.id, temperature, tokens)
    case "deepseek":
      return generateWithDeepSeek(prompt, apiKey, model.id, temperature, tokens)
    case "gemini":
      return generateWithGemini(prompt, apiKey, model.id, temperature, tokens)
    default:
      throw new Error(`Provider ${model.provider} not supported`)
  }
}

// Process reference links to get content
async function processReferenceLinks(links: string[], userId: string, modelId: string): Promise<string> {
  if (links.length === 0) {
    return ""
  }

  const contentSummaries = []

  for (const url of links) {
    try {
      // Check if we already have scraped this URL
      const existingContent = await db.query("SELECT title, summary, created_at FROM scraped_content WHERE url = $1", [url])
      const currentTime = new Date()
      //chcek if the content is older than 1 week
      //const isOlder = new Date(existingContent[0].created_at)-currentTime
      if (existingContent.length > 0) {
        contentSummaries.push(`
          URL: ${url}
          Title: ${existingContent[0].title || "Unknown"}
          Summary: ${existingContent[0].summary || "No summary available"}
        `)
      } else {
        // Scrape the URL
        const { title, content } = await scrapeUrl(url)


        //create a summary of the content using ai

        const summaryPrompt = `
          Summarize the following content in no more than 950 words.
          Priorise long-term value and relevance.
          and technical details.
          and dates.
          ${content}

          The summary language should be on english.
          Just return the summary no other text:
        `

        const summary = await generateText(userId, summaryPrompt, modelId, 0.7,2048*4)

        // Store in database
        await db.query("INSERT INTO scraped_content (url, title, content, summary) VALUES ($1, $2, $3, $4)", [url, title, content, summary])

        contentSummaries.push(`
          URL: ${url}
          Title: ${title || "Unknown"}
          Content: ${content.substring(0, 1000)}${content.length > 1000 ? "..." : ""}
          Summary: ${summary}
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
  userId: string,
  referenceLinks: string[] = [],
  modelId = "cohere-command",
  extraInstructions = "",
  amount = 5,
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
    const referencesContent = await processReferenceLinks(links, userId, modelId)

    // Get previously generated topics to avoid duplicates
    const previousTopics = await db.query("SELECT topic_hash FROM generated_topics WHERE user_id = $1", [userId])
    const previousTopicHashes = new Set(previousTopics.map((t) => t.topic_hash))

    // Generate topics using AI
    const prompt = `
      Generate ${amount} trending and relevant professional topics for a LinkedIn post.
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
      (Do not return as markdown code block, just return the JSON array as raw text)
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

    let text = await generateText(userId, prompt, modelId, 0.7)

    text = sanitizeJSONString(text)

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
  userId: string,
  modelId = "cohere-command",
  useChainOfThought = false,
  schema: PostSchema = "default",
  extraInstructions = "",
  links: string[] = [],
  amount: number = 5,
): Promise<any[]> {
  try {
    // Get the topic
    const topicResult = await db.query("SELECT * FROM topics WHERE id = $1 AND user_id = $2", [topicId, userId])

    if (!topicResult.length) {
      throw new Error("Topic not found or doesn't belong to user")
    }
    
    const referencesContent = await processReferenceLinks(links, userId, modelId)

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
      Generate ${amount} engaging LinkedIn posts about "${topic.title}".
      The user works in ${user.career || "technology"}.
      Their interests include: ${user.interests || "professional development"}.
      Their professional values include: ${user.ideals || "innovation and growth"}.
      
      ${schemaInstructions}
      
      For each post:
      1. Make it professional and engaging
      2. Include relevant hashtags
      3. Make it sound authentic and personal
      4. Include a suggested image description that could be used to search for or generate an image with AI (image_suggestion field) [Be detailed]
      
      Follow these extra instructions if provided:
      ${extraInstructions}

      Include the content from the reference links that should inform the posts:
      ${referencesContent ? `\n${referencesContent}` : ""}

      Suggestions:
      Dot make overwhelming the reader with too much information.
      Should not be too long, but not too short.
      Likely to resonate with professionals in the field.

      The content language should be on ${langToFormated(user.lang || "en")} .
      Format the response as a JSON array with objects containing:
      - 'content': The final LinkedIn post
      - 'image_suggestion': A brief description of an image that would complement the post
      - 'title': A title for the post
      DO NOT include the image suggestion in the post content.
      like this:
      Just return the JSON array no other text:
      (Do not return as markdown code block, just return the JSON array as raw text)
      [
        {
          "content": "Post 1 content",
          "image_suggestion": "Post 1 image suggestion",
          "title": "Post 1 title"
        },
        {
          "content": "Post 2 content",
          "image_suggestion": "Post 2 image suggestion",
          "title": "Post 2 title"
        }
      ]
    `

    let chainOfThoughts: string[] = []
    let postsData: any[] = []
    if (useChainOfThought) {
      // Step 1: Generate chain-of-thought reasoning for each post
      const cotPrompt = `
    For the topic "${topic.title}", the user works in ${user.career || "technology"}.
    Their interests include: ${user.interests || "professional development"}.
    Their professional values include: ${user.ideals || "innovation and growth"}.

    ${schemaInstructions}

    Generate a step-by-step chain-of-thought reasoning for creating ${amount} engaging LinkedIn posts about this topic.
    For each post, provide a numbered list of reasoning steps, each on a new line, covering:
    1. The target audience for the post.
    2. The most relevant aspects of the topic for the user's field.
    3. How to frame the topic to align with the user's professional values.
    4. The structure: hook, main points, call to action.
    5. Hashtags that would increase visibility.
    6. A detailed image suggestion that would complement the post.

    Guidelines:
    - Make each reasoning list clear, concise, and actionable.
    - Use the following checklist for each post:
      🧠 Is it clear and concise? Break long blocks into short, scannable paragraphs.
      💡 Does it spark curiosity or offer value? Share insights, lessons, or unique perspectives.
      🎯 Is it relevant to professionals? Focus on growth, innovation, career, or collaboration.
      📢 Is there a reason to engage or share? Include a hook or question to start conversations.
      🧍‍♂️ Does it sound professional? Keep the tone respectful, relatable, and typo-free.

    Format the response as a JSON array of ${amount} objects, each with a 'reasoning' field.
    Each 'reasoning' value should be a single string with each step on a new line, numbered (e.g., "1. ...\\n2. ...\\n3. ...").
    Just return the JSON array, no other text:
    [
      { "reasoning": "1. Target audience: tech professionals.\\n2. Relevant aspects: latest trends in AI.\\n3. Framing: innovation and growth.\\n4. Structure: hook, main points, call to action.\\n5. Hashtags: #AI #Innovation #Growth\\n6. Image suggestion: AI technology in action." },
      { "reasoning": "..." }
    ]
    `
      const cotText = await generateText(userId, cotPrompt, modelId, 0.7, 2048)
      const cotData = JSON.parse(cotText)
      chainOfThoughts = cotData.map((item: any) => item.reasoning)
      for (let i = 0; i < chainOfThoughts.length; i++) {
        if (chainOfThoughts[i].startsWith("{")) {
          chainOfThoughts[i] = chainOfThoughts[i].replace(/^\{/, "").replace(/\}$/, "").trim()
          //if "," convert to "\n"
          chainOfThoughts[i] = chainOfThoughts[i].replace(/,/g, "\n")
          // remove all double quotes
          chainOfThoughts[i] = chainOfThoughts[i].replace(/"/g, "")
          
        }
      }
      

      const postPromises = chainOfThoughts.map((cot, idx) => {
        const singlePrompt = `
  Generate one engaging LinkedIn post about "${topic.title}".
  The user works in ${user.career || "technology"}.
  Their interests include: ${user.interests || "professional development"}.
  Their professional values include: ${user.ideals || "innovation and growth"}.

  ${schemaInstructions}

  Use the following chain-of-thought reasoning for this post:
  ${cot}

  Follow these extra instructions if provided:
  ${extraInstructions}

  Include the content from the reference links that should inform the post:
  ${referencesContent ? `\n${referencesContent}` : ""}

  Requirements:
  1. Make it professional and engaging
  2. Include relevant hashtags
  3. Make it sound authentic and personal
  4. Include a suggested image description that could be used to search for or generate an image with AI (image_suggestion field) [Be detailed]

  Suggestions:
  Dot make overwhelming the reader with too much information.
  Should not be too long, but not too short.
  Likely to resonate with professionals in the field.

  Format the response as a JSON object with:
  - 'content': The final LinkedIn post
  - 'image_suggestion': A brief image description
  - 'title': A title for the post

  Language: ${langToFormated(user.lang || "en")}
  Just return the JSON object, no other text:
  DO NOT include the image suggestion in the post content.
  Return the content and image suggestion in the language ${langToFormated(user.lang || "en")}.
  Just return the JSON array, no other text:
  (Do not return as markdown code block, just return the JSON array as raw text)
    {
    "content": "Post content",
    "image_suggestion": "Post image suggestion",
    "title": "Post title"
    }
  `

        return generateText(userId, singlePrompt, modelId, 0.7, 2048).then(res => {
          const clean = sanitizeJSONString(res)
          const parsed = JSON.parse(clean)
          parsed.reasoning = cot // opcional: agregar reasoning al resultado
          return parsed
        })
      })

      postsData = await Promise.all(postPromises)


    } else {

      let text = await generateText(userId, prompt, modelId, 0.7, 2048)

      //if remove starting ```json and end ``` if it contains
      text = sanitizeJSONString(text)
      // Parse the response
      postsData = JSON.parse(text)
    }


    // Generate engagement scores for each post
    const scorePrompt = `
You are a critical evaluator trained to assess the potential impact of LinkedIn posts. Predict performance using historical patterns, inferred audience behavior, and best practices for professional content.

Analyze each post with a critical lens, identifying both strengths and weaknesses behind every score. Think as if you are training an AI to learn what works and what doesn’t — so be sharp and discerning.

Posts:
${postsData.map((post: any, index: number) => `Post ${index + 1}: ${post.content}`).join("\n\n")}

For each post, return the following scores between 0.0 and 1.0:
1. engagement_score: Predicted interaction potential (likes, comments, shares).
2. attractiveness_score: Visual clarity, layout, formatting, and scannability.
3. interest_score: Ability to spark curiosity or intrigue among professionals.
4. relevance_score: Alignment with professional interests, trends, or career growth.
5. shareability_score: Likelihood the post will be organically reshared by others.
6. professional_score: Adherence to LinkedIn’s professional tone, language, and standards.

Critical Evaluation Rules:

Posts with vague messaging, dense text blocks, or excessive jargon should score lower.
Posts with clarity, conciseness, and relevance to innovation, career growth, or industry insight should score higher.
Repetitive or redundant information should be penalized.
Posts that include unnecessary or filler content reduce both attractiveness and engagement.
Use of relational language (e.g., collaboration, shared learning, appreciation) increases professional tone and overall credibility.
Avoid overwhelming the reader with too much information—brevity supports clarity and impact.
Learn from patterns: posts with vague messaging, dense blocks of text, or excessive jargon should score lower. Posts with clarity, specificity, and relevance to career, innovation, or growth should score higher.



Respond only with a JSON array of objects like this:
[
  {
    "engagement_score": 0.73,
    "attractiveness_score": 0.66,
    "interest_score": 0.81,
    "relevance_score": 0.77,
    "shareability_score": 0.72,
    "professional_score": 0.88
  }
]
Return only the JSON array. Do not explain or describe anything else.
`

    let scoresText = await generateText(userId, scorePrompt, modelId, 0.3)
    
    scoresText = sanitizeJSONString(scoresText)
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
      const title = post.title || `Your relinkeder Post`
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
          schema_used,
          title
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
          title,
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
