"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { useCustomAlerts } from "@/hooks/use-custom-alerts"
import { ChevronDown, ChevronUp, Copy, ImageIcon, Share2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface PostCardProps {
  post: {
    id: number
    content: string
    engagement_score: number
    attractiveness_score: number
    interest_score: number
    relevance_score: number
    shareability_score: number
    professional_score: number
    reasoning?: string
    model_used?: string
    image_suggestion?: string
    schema_used?: string
    created_at?: string
  }
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>
  sharedUrl?: string
}

export default function PostCard({ post, setPosts, sharedUrl }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [isReasoningOpen, setIsReasoningOpen] = useState(false)
  const [isImageSuggestionOpen, setIsImageSuggestionOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const [copyUrl, setCopyUrl] = useState("")
  
  const { alert, confirm, either } = useCustomAlerts();
  async function onDelete() {
    if(sharedUrl) return;
    console.log("Deleting post:", post.id)
    const confirmed = await confirm("Are you sure you want to delete this post?");
    if (confirmed) {
      // Call the delete post API
      fetch("/api/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("post deleted successfully")
            if(setPosts) {
              setPosts((prevPosts) => prevPosts.filter((t) => t.id !== post.id))
            }
          } else {
            alert("Failed to delete post")
          }
        })
    }
  }
  function copyToClipboard() {
    navigator.clipboard.writeText(post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Map schema to badge color
  const schemaBadgeColor = () => {
    switch (post.schema_used) {
      case "informative-long":
      case "informative":
        return "bg-blue-100 text-blue-800"
      case "experience-long":
      case "experience":
        return "bg-green-100 text-green-800"
      case "curiosity-long":
      case "curiosity":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format schema name
  const formatSchemaName = () => {
    if (!post.schema_used) return "Default"
    return post.schema_used.charAt(0).toUpperCase() + post.schema_used.slice(1)
  }

  async function sharePost() {
    if (sharedUrl) {
      //copy the shared URL to clipboard
      navigator.clipboard.writeText(sharedUrl)
      return alert("Shared URL copied to clipboard")
    }
    try {
      setIsSharing(true)
      const response = await fetch("/api/shared", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      })
      const data = await response.json()
      if (data.success) {
        const shareUrl = window.location.origin + "/shared/" + data.shareId
        setCopyUrl(shareUrl)
        setIsSharing(false)
      } else {
        alert("Failed to share post")
      }
    } catch (error) {
      console.error("Error sharing post:", error)
      alert("Failed to share post")
    }
  }
useEffect(() => {
  if (copyUrl && document.hasFocus()) {
    navigator.clipboard.writeText(copyUrl)
      .then(() => {
        console.log("Shared URL:", copyUrl)
        alert("Shared URL copied to clipboard")
      })
      .catch(err => {
        console.error("Clipboard write failed", err)
      })
  } else if (copyUrl) {
    console.warn("Cannot copy: Document is not focused.")
  }
}, [copyUrl])


  return (
    <Card className="relinkeder-feed-item">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relinkeder-avatar bg-gray-200"></div>
            <div>
              <CardTitle className="text-base">Your relinkeder Post</CardTitle>
              <div className="flex items-center gap-2">
                {(() => {
                  if (!post.created_at) return null;
                  const createdAt = new Date(post.created_at);
                  const now = new Date();
                  const diffMs = now.getTime() - createdAt.getTime();
                  const diffMins = diffMs / 60000;
                  if (diffMins < 1) return "Just now";
                  return createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                })()}• {post.model_used || "AI Generated"}
                {post.schema_used && (
                  <Badge variant="outline" className={`text-xs ${schemaBadgeColor()}`}>
                    {formatSchemaName()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
{!sharedUrl &&(            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10"
              aria-label="Delete topic"
            >
              <Trash2 className="h-5 w-5" />
            </Button>)}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="mb-4 whitespace-pre-wrap text-[#191919]">{post.content}</div>

        {post.image_suggestion && (
          <Collapsible
            open={isImageSuggestionOpen}
            onOpenChange={setIsImageSuggestionOpen}
            className="mb-4 rounded-md border border-gray-200"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-gray-50 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Suggested Image</span>
              </div>
              {isImageSuggestionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 text-sm text-gray-700">
              <p>{post.image_suggestion}</p>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="relinkeder-divider"></div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement</span>
              <span className="text-sm text-gray-500">{Math.round(post.engagement_score * 100)}%</span>
            </div>
            <Progress value={post.engagement_score * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Attractiveness</span>
              <span className="text-sm text-gray-500">{Math.round(post.attractiveness_score * 100)}%</span>
            </div>
            <Progress value={post.attractiveness_score * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Interest</span>
              <span className="text-sm text-gray-500">{Math.round(post.interest_score * 100)}%</span>
            </div>
            <Progress value={post.interest_score * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Relevance</span>
              <span className="text-sm text-gray-500">{Math.round(post.relevance_score * 100)}%</span>
            </div>
            <Progress value={post.relevance_score * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Shareability</span>
              <span className="text-sm text-gray-500">{Math.round(post.shareability_score * 100)}%</span>
            </div>
            <Progress value={post.shareability_score * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Professionalism</span>
              <span className="text-sm text-gray-500">{Math.round(post.professional_score * 100)}%</span>
            </div>
            <Progress value={post.professional_score * 100} className="h-2" />
          </div>
        </div>

        {post.reasoning && (
          <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen} className="mt-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-gray-50 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <span>Chain of Thought Reasoning</span>
              {isReasoningOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              <pre className="whitespace-pre-wrap font-sans">{post.reasoning}</pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="relinkeder-reaction-button" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>

            <Button
            variant="ghost"
            size="sm"
            className="relinkeder-reaction-button"
            onClick={sharePost}
            disabled={isSharing}
            >
            {isSharing ? (
              <>
              <svg className="h-4 w-4 animate-spin mr-1" viewBox="0 0 24 24" fill="none">
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                />
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Sharing...</span>
              </>
            ) : (
              <>
              <Share2 className="h-4 w-4" />
              <span>Share</span>
              </>
            )}
            </Button>
        </div>

        {/*Button size="sm" className="rounded-full bg-primary px-4 py-1  hover:bg-primary-dark">
          Post to LinkedIn
        </Button>*/}
      </CardFooter>
    </Card>
  )
}
