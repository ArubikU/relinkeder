"use client"

import MobilePostCard from "@/components/mobile-post-card"
import PostCard from "@/components/post-card"
import ReferenceLinksInput from "@/components/reference-links-input"
import RequireAuth from "@/components/require-auth"
import TopicCard from "@/components/topic-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AIModel, PostSchema, PostSchemaTemplate } from "@/lib/ai"
import type { User } from "@/lib/auth"
import {
  generatePosts,
  generateTopics,
  getAvailableModels,
  getCurrentUser,
  getUserApiKeys,
  saveReferenceLinks,
} from "@/lib/client-api"
import useLocalStorage from "@/lib/use-local-storage"
import { useUser } from "@clerk/nextjs"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function DashboardPage() {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false)
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false)
  const [topics, setTopics] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState("cohere-command-r-plus")
  const [selectedSchema, setSelectedSchema] = useState<PostSchema>("default")
  const [referenceLinks, setReferenceLinks] = useState<string[]>([])
  const [useChainOfThought, setUseChainOfThought] = useState(true)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [availableSchemas, setAvailableSchemas] = useState<PostSchemaTemplate[]>([])
  const [userApiKeys, setUserApiKeys] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [extraInstructions, setExtraInstructions] = useLocalStorage<string>("extra-instructions","")
  const [extraInstructionsVisible, setExtraInstructionsVisible] = useLocalStorage("extra-instructions-visible",false)
  const [topicAmount, setTopicAmount] = useLocalStorage("topic-amount", 5)
  const [postAmount, setPostAmount] = useLocalStorage("post-amount", 5)


  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches


  useEffect(() => {
    //check if ?signUp=true is in the URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has("signUp")) {
      const signUp = urlParams.get("signUp")
      if (signUp === "true") {
        fetch("/api/auth/register")
      }
    }

  },[])

  useEffect(() => {
    async function fetchUserData() {
      if (!isLoaded || !clerkUser) return;
      
      try {
        const userData = await getCurrentUser()

        if (!userData) {
          router.push("/settings")
          return
        }

        setUser(userData)

        // Fetch available models and schemas
        const { models, schemas } = await getAvailableModels()
        setAvailableModels(models)
        setAvailableSchemas(schemas)

        // Fetch user API keys
        const keys = await getUserApiKeys()
        setUserApiKeys(keys)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }
    async function fetchTopics() {
      try {
        const response = await fetch("/api/topics")
        if (!response.ok) {
          throw new Error("Failed to fetch topics")
        }
        const data = await response.json()
        setTopics(data.topics)
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts")
        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }
        const data = await response.json()
        setPosts(data.posts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      }
    }    fetchUserData()
    fetchTopics()
    fetchPosts()
  }, [router, clerkUser, isLoaded])

  async function handleGenerateTopics() {
    setIsGeneratingTopics(true)
    setError(null)

    try {
      // Check if user has the API key for the selected model
      const modelInfo = availableModels.find((m) => m.id === selectedModel)
      if (!modelInfo) {
        throw new Error(`Model ${selectedModel} not found`)
      }

      if (!userApiKeys[modelInfo.provider]) {
        throw new Error(`You need to add your ${modelInfo.provider} API key in your profile settings`)
      }

      const newTopics = await generateTopics(referenceLinks, selectedModel, extraInstructions, topicAmount)
      setTopics(prevTopics => [...newTopics, ...prevTopics])
    } catch (error: any) {
      console.error("Error generating topics:", error)
      setError(error.message || "Failed to generate topics")
    } finally {
      setIsGeneratingTopics(false)
    }
  }

  async function handleGeneratePosts(topicId: number) {
    setIsGeneratingPosts(true)
    setSelectedTopic(topicId)
    setError(null)

    try {
      // Check if user has the API key for the selected model
      const modelInfo = availableModels.find((m) => m.id === selectedModel)
      if (!modelInfo) {
        throw new Error(`Model ${selectedModel} not found`)
      }

      if (!userApiKeys[modelInfo.provider]) {
        throw new Error(`You need to add your ${modelInfo.provider} API key in your profile settings`)
      }

      const newPosts = await generatePosts(topicId, selectedModel, useChainOfThought, selectedSchema, extraInstructions, referenceLinks, postAmount)
      setPosts(prevPosts => [...newPosts, ...prevPosts])
    } catch (error: any) {
      console.error("Error generating posts:", error)
      setError(error.message || "Failed to generate posts")
    } finally {
      setIsGeneratingPosts(false)
    }
  }

  async function handleSaveReferenceLinks(links: string[]) {
    setReferenceLinks(links)
    await saveReferenceLinks(links)
  }

  // Group models by provider
  const modelsByProvider: Record<string, AIModel[]> = {}
  availableModels.forEach((model) => {
    if (!modelsByProvider[model.provider]) {
      modelsByProvider[model.provider] = []
    }
    modelsByProvider[model.provider].push(model)
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12" />
      <div className="text-lg font-semibold text-gray-700">Loading your dashboard...</div>
      <div className="mt-2 text-sm text-gray-500">Please wait while we fetch your data.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#191919]">Dashboard</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="topics" className="w-full">
            <TabsList className="mb-6 bg-white">
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="posts">Generated Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="topics">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#191919]">Trending Topics</h2>
                <Button onClick={handleGenerateTopics} disabled={isGeneratingTopics}>
                  {isGeneratingTopics ? "Generating..." : "Generate New Topics"}
                </Button>
              </div>

              {topics.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-medium">No Topics Generated Yet</h3>
                    <p className="mb-6 max-w-md text-gray-600">
                      Add reference links and click the "Generate New Topics" button to discover trending topics
                      relevant to your industry and interests.
                    </p>
                    <Button onClick={handleGenerateTopics} disabled={isGeneratingTopics}>
                      {isGeneratingTopics ? "Generating..." : "Generate Topics"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onGeneratePosts={() => handleGeneratePosts(topic.id)}
                      isGenerating={isGeneratingPosts && selectedTopic === topic.id}
                      setTopics={setTopics}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#191919]">Generated Posts</h2>
              </div>

              {posts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-8 w-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-medium">No Posts Generated Yet</h3>
                    <p className="mb-6 max-w-md text-gray-600">
                      First, generate topics and then select a topic to generate LinkedIn posts based on that topic.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  
                  {posts.map((post) => {

                    if (isMobile) {
                      return (
                    <MobilePostCard key={post.id} post={post} setPosts={setPosts} />
                      )
                    }else{
                      
                      return (
                    <PostCard key={post.id} post={post} setPosts={setPosts} />
                      )
                    }

                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="relinkeder-card mb-6">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Reference Links</h3>
              <ReferenceLinksInput onSave={handleSaveReferenceLinks} />
              <p className="mt-2 text-xs text-gray-500">
                Add links to articles or resources. The content will be automatically scraped and used to generate more
                relevant topics.
              </p>
            </CardContent>
          </Card>

          <Card className="relinkeder-card mb-6">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Post Schema</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schema">Content Style</Label>
                  <Select value={selectedSchema} onValueChange={(value) => setSelectedSchema(value as PostSchema)}>
                    <SelectTrigger id="schema">
                      <SelectValue placeholder="Select a schema" />
                    </SelectTrigger>
                    <SelectContent className="relinkeder-card">
                      {availableSchemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {availableSchemas.find((s) => s.id === selectedSchema)?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relinkeder-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Extra Instructions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExtraInstructionsVisible((v) => !v)}
                >
                  {extraInstructionsVisible ? "Hide" : "Edit"}
                </Button>
              </div>
              {extraInstructionsVisible ? (
                <textarea
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                  rows={3}
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  placeholder="Add any extra instructions for the AI (e.g. tone, audience, hashtags)..."
                />
              ) : (
                <div className="text-sm text-gray-700 min-h-[2.5rem]">
                  {extraInstructions ? extraInstructions : <span className="text-gray-400">No extra instructions set.</span>}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Optional: Add extra instructions for the AI to follow when generating posts (e.g. tone, audience, hashtags).
              </p>
            </CardContent>
          </Card>

          <Card className="relinkeder-card">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Generation Settings</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select
                    value={availableModels.find((m) => m.id === selectedModel)?.provider || "cohere"}
                    onValueChange={(provider) => {
                      // Select the first model from this provider
                      const firstModel = modelsByProvider[provider]?.[0]
                      if (firstModel) {
                        setSelectedModel(firstModel.id)
                      }
                    }}
                    
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent className="relinkeder-card">
                      {Object.keys(modelsByProvider).map((provider) => (
                        <SelectItem key={provider} value={provider} disabled={!userApiKeys[provider]}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          {!userApiKeys[provider] && " (API key required)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="relinkeder-card">
                      {availableModels
                        .filter(
                          (m) => m.provider === availableModels.find((model) => model.id === selectedModel)?.provider,
                        )
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/*amount of topics and posts*/}
                <div>
                  <h4 className="text-md font-semibold mb-2">Generation Amounts</h4>
                  <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="topic-amount" className="min-w-[120px]">Topics to Generate</Label>
                    <input
                    id="topic-amount"
                    type="number"
                    min={1}
                    max={20}
                    value={topicAmount}
                    onChange={(e) => setTopicAmount(Number(e.target.value))}
                    className="w-20 rounded border border-gray-300 p-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="post-amount" className="min-w-[120px]">Posts per Topic</Label>
                    <input
                    id="post-amount"
                    type="number"
                    min={1}
                    max={20}
                    value={postAmount}
                    onChange={(e) => setPostAmount(Number(e.target.value))}
                    className="w-20 rounded border border-gray-300 p-1 text-sm"
                    />
                  </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chain-of-thought"
                    checked={useChainOfThought}
                    onChange={(e) => setUseChainOfThought(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="chain-of-thought">Use Chain of Thought</Label>
                </div>

                <p className="text-xs text-gray-500">
                  Chain of Thought improves post quality by having the AI reason through the content step by step.
                </p>

                {!userApiKeys[availableModels.find((m) => m.id === selectedModel)?.provider || ""] && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to add your {availableModels.find((m) => m.id === selectedModel)?.provider} API key in
                      your{" "}
                      <a href="/settings" className="font-medium text-primary hover:underline">
                        profile settings
                      </a>{" "}
                      to use this model.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>      </div>
    </div>
  )
}

// Envolver la página del Dashboard con el componente RequireAuth
function ProtectedDashboardPage() {
  return (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  )
}

export default ProtectedDashboardPage
