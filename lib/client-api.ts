// Client-side API functions

// Auth
export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  return response.json()
}

export async function registerUser(name: string, email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  })

  return response.json()
}

export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  })

  return response.json()
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/user")
  const data = await response.json()

  if (!data.success) {
    return null
  }

  return data.user
}

// Profile
export async function saveUserProfile(name: string, career: string, interests: string, ideals: string,lang: string) {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, career, interests, ideals, lang }),
  })

  return response.json()
}

// API Keys
export async function getUserApiKeys() {
  const response = await fetch("/api/api-keys")
  const data = await response.json()

  if (!data.success) {
    return {}
  }

  return data.apiKeys
}

export async function saveApiKeys(apiKeys: Record<string, string>) {
  const response = await fetch("/api/api-keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiKeys),
  })

  return response.json()
}

// Reference Links
export async function getReferenceLinks() {
  const response = await fetch("/api/reference-links")
  const data = await response.json()

  if (!data.success) {
    return []
  }

  return data.links
}

export async function saveReferenceLinks(links: string[]) {
  const response = await fetch("/api/reference-links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ links }),
  })

  return response.json()
}

// Topics
export async function getTopics() {
  const response = await fetch("/api/topics")
  const data = await response.json()

  if (!data.success) {
    return []
  }

  return data.topics
}

export async function generateTopics(referenceLinks: string[] = [], modelId = "cohere-command", extraInstructions = "") {
  const response = await fetch("/api/topics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ referenceLinks, modelId, extraInstructions }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to generate topics")
  }

  return data.topics
}

// Posts
export async function getPosts(topicId: number) {
  const response = await fetch(`/api/posts?topicId=${topicId}`)
  const data = await response.json()

  if (!data.success) {
    return []
  }

  return data.posts
}

export async function deletePost(postId: number) {
  const response = await fetch("/api/posts", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId }),
  })

  return response.json()
}
export async function deleteTopic(topicId: number) {
  const response = await fetch("/api/topics", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topicId }),
  })

  return response.json()
}
export async function generatePosts(
  topicId: number,
  modelId = "cohere-command-r-plus",
  useChainOfThought = false,
  schema = "default",
  extraInstructions = ""
) {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topicId, modelId, useChainOfThought, schema, extraInstructions }),
  })

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || "Failed to generate posts")
  }

  return data.posts
}

// Models
export async function getAvailableModels() {
  const response = await fetch("/api/models")
  const data = await response.json()

  if (!data.success) {
    return { models: [], schemas: [] }
  }

  return { models: data.models, schemas: data.schemas }
}
