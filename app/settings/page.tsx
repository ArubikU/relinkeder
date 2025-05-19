"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { User } from "@/lib/auth"
import { getCurrentUser, getUserApiKeys, saveApiKeys, saveUserProfile } from "@/lib/client-api"
import { langs } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isApiKeysLoading, setIsApiKeysLoading] = useState(false)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    cohere: "",
    openai: "",
    mistral: "",
    deepseek: "",
  })
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [apiKeysSuccess, setApiKeysSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [apiKeysError, setApiKeysError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await getCurrentUser()

        if (!userData) {
          router.push("/login")
          return
        }

        setUser(userData)

        // Fetch API keys
        const keys = await getUserApiKeys()
        setApiKeys((prev) => ({ ...prev, ...keys }))
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsProfileLoading(true)
    setProfileSuccess(false)
    setProfileError(null)

    if (!user) return

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const career = formData.get("career") as string
      const interests = formData.get("interests") as string
      const ideals = formData.get("ideals") as string
      let lang = user.lang || formData.get("lang") as string
      //validate lang so set it to default if not valid
      const validLang = langs.find((l) => l.code === lang)
      if (!validLang) {
        lang = "en"
      }

      const result = await saveUserProfile(career, interests, ideals, lang)

      if (result.success) {
        setProfileSuccess(true)
        // Update user data
        const userData = await getCurrentUser()
        setUser(userData)
      } else {
        setProfileError(result.message || "Failed to save profile")
      }
    } catch (error) {
      setProfileError("An unexpected error occurred")
    } finally {
      setIsProfileLoading(false)
    }
  }

  async function handleApiKeysSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsApiKeysLoading(true)
    setApiKeysSuccess(false)
    setApiKeysError(null)

    try {
      const result = await saveApiKeys(apiKeys)

      if (result.success) {
        setApiKeysSuccess(true)
      } else {
        setApiKeysError(result.message || "Failed to save API keys")
      }
    } catch (error) {
      setApiKeysError("An unexpected error occurred")
    } finally {
      setIsApiKeysLoading(false)
    }
  }

  function handleApiKeyChange(provider: string, value: string) {
    setApiKeys((prev) => ({ ...prev, [provider]: value }))
  }

  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 min-h-[60vh]">
        <div className="flex items-center gap-3 mb-4">
          <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span className="text-lg font-semibold text-primary">Loading your settings...</span>
        </div>
        <p className="text-gray-500">Please wait while we fetch your information.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#191919]">Your Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relinkeder-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>Tell us about yourself so we can personalize your content</CardDescription>
          </CardHeader>
          <CardContent>
            {profileSuccess && (
              <Alert className="mb-4 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">Personal information saved successfully!</AlertDescription>
              </Alert>
            )}

            {profileError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="relinkeder-input"
                  defaultValue={user?.email || ""}
                  disabled
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="career">Career/Industry</Label>
                <Input
                  id="career"
                  name="career"
                  placeholder="Software Engineering, Marketing, etc."
                  className="relinkeder-input"
                  defaultValue={user?.career || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Professional Interests</Label>
                <Textarea
                  id="interests"
                  name="interests"
                  placeholder="AI, Web Development, Digital Marketing, etc."
                  className="min-h-[100px] relinkeder-input"
                  defaultValue={user?.interests || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ideals">Professional Values & Ideals</Label>
                <Textarea
                  id="ideals"
                  name="ideals"
                  placeholder="Innovation, Collaboration, Work-Life Balance, etc."
                  className="min-h-[100px] relinkeder-input"
                  defaultValue={user?.ideals || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Preferred Language</Label>

                <Select
                  value={user?.lang || ""}
                  onValueChange={(value) => {
                    // Update the input value for form submission
                    const input = document.getElementById("lang-hidden-input") as HTMLInputElement
                    if (input) input.value = value
                    setUser((prev) => prev ? { ...prev, lang: value } : prev)
                  }}
                >
                  <SelectTrigger id="lang" className="relinkeder-input">
                    <SelectValue placeholder={user?.lang || "Select a language"} />
                  </SelectTrigger>
                  <SelectContent className="relinkeder-card">
                    {langs.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Hidden input to ensure form submission */}
                <input
                  type="hidden"
                  id="lang-hidden-input"
                  name="lang"
                  defaultValue={user?.lang || ""}
                  required
                />
                <p className="text-xs text-gray-500">This will be used for content generation</p>
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={isProfileLoading}>
                {isProfileLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="relinkeder-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">API Keys</CardTitle>
              <CardDescription>Connect your AI and LinkedIn accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeysSuccess && (
                <Alert className="mb-4 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">API keys saved successfully!</AlertDescription>
                </Alert>
              )}

              {apiKeysError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiKeysError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleApiKeysSubmit} className="space-y-4">
                <Tabs defaultValue="cohere" className="w-full">
                  <TabsList className="mb-4 flex w-full flex-wrap sm:flex-nowrap sm:overflow-x-auto sm:gap-2">
                    <TabsTrigger value="cohere" className="flex-1 min-w-[100px]">Cohere</TabsTrigger>
                    <TabsTrigger value="openai" className="flex-1 min-w-[100px]">OpenAI</TabsTrigger>
                    <TabsTrigger value="mistral" className="flex-1 min-w-[100px]">Mistral</TabsTrigger>
                    <TabsTrigger value="deepseek" className="flex-1 min-w-[100px]">DeepSeek</TabsTrigger>
                    <TabsTrigger value="gemini" className="flex-1 min-w-[100px]">Gemini</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cohere" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cohere_api_key">Cohere API Key</Label>
                      <Input
                        id="cohere_api_key"
                        type="password"
                        placeholder="Enter your Cohere API key"
                        className="relinkeder-input"
                        value={apiKeys.cohere}
                        onChange={(e) => handleApiKeyChange("cohere", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Get this from{" "}
                        <a
                          href="https://dashboard.cohere.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-blue-500"
                        >
                          Cohere Dashboard
                        </a>
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="gemini" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gemini_api_key">Gemini API Key</Label>
                      <Input
                        id="gemini_api_key"
                        type="password"
                        placeholder="Enter your Gemini API key"
                        className="relinkeder-input"
                        value={apiKeys.gemini}
                        onChange={(e) => handleApiKeyChange("gemini", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Get this from{" "}
                        <a
                          href="https://console.gemini.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-blue-500"
                        >
                          Gemini Console
                        </a>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="openai" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                      <Input
                        id="openai_api_key"
                        type="password"
                        placeholder="Enter your OpenAI API key"
                        className="relinkeder-input"
                        value={apiKeys.openai}
                        onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Get this from{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-blue-500"
                        >
                          OpenAI Dashboard
                        </a>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="mistral" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mistral_api_key">Mistral API Key</Label>
                      <Input
                        id="mistral_api_key"
                        type="password"
                        placeholder="Enter your Mistral API key"
                        className="relinkeder-input"
                        value={apiKeys.mistral}
                        onChange={(e) => handleApiKeyChange("mistral", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Get this from{" "}
                        <a
                          href="https://console.mistral.ai/api-keys/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-blue-500"
                        >
                          Mistral AI Console
                        </a>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="deepseek" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deepseek_api_key">DeepSeek API Key</Label>
                      <Input
                        id="deepseek_api_key"
                        type="password"
                        placeholder="Enter your DeepSeek API key"
                        className="relinkeder-input"
                        value={apiKeys.deepseek}
                        onChange={(e) => handleApiKeyChange("deepseek", e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Get this from the DeepSeek platform</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_api_key">LinkedIn API Key</Label>
                  <Input
                    id="linkedin_api_key"
                    type="password"
                    placeholder="Enter your LinkedIn API key"
                    className="relinkeder-input"
                    value={apiKeys.linkedin || ""}
                    onChange={(e) => handleApiKeyChange("linkedin", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Get this from the LinkedIn Developer Portal</p>
                </div>

                <Button type="submit" className="w-full rounded-full" disabled={isApiKeysLoading}>
                  {isApiKeysLoading ? "Saving..." : "Save API Keys"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start pt-0">
              <p className="text-sm text-gray-500">
                Your API keys are stored securely and are only used to generate and post content on your behalf.
              </p>
            </CardFooter>
          </Card>

          <Card className="relinkeder-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Supported AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cohere Models</p>
                    <p className="text-sm text-gray-500">Command, Command Light, Command R, Command R+</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">OpenAI Models</p>
                    <p className="text-sm text-gray-500">GPT-3.5 Turbo, GPT-4</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Mistral Models</p>
                    <p className="text-sm text-gray-500">Mistral 7B, Mixtral 8x7B</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">DeepSeek Models</p>
                    <p className="text-sm text-gray-500">DeepSeek Chat</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Gemini Models</p>
                    <p className="text-sm text-gray-500">Gemini Pro, Gemini 1.5, etc</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
