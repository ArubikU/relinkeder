"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCustomAlerts } from "@/hooks/use-custom-alerts"
import { Copy, ImageIcon, Share2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getPublishabilityScore, PostCardProps } from "./post-card"

export default function MobilePostCard({ post, setPosts, sharedUrl }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [copyUrl, setCopyUrl] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const { alert, confirm } = useCustomAlerts()

  const publishabilityScore = getPublishabilityScore(post)

  const schemaStyle = {
    informative: "bg-blue-100 text-blue-800",
    experience: "bg-green-100 text-green-800",
    curiosity: "bg-purple-100 text-purple-800",
  }

  const schemaColor = schemaStyle[post.schema_used?.split("-")[0] as keyof typeof schemaStyle] ?? "bg-gray-100 text-gray-800"

  const formatDate = (raw?: string) => {
    if (!raw) return ""
    const d = new Date(raw)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  async function handleDelete() {
    if (sharedUrl) return
    const confirmed = await confirm("Delete this post?")
    if (!confirmed) return
    const res = await fetch("/api/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    })
    const data = await res.json()
    if (data.success) {
      alert("Post deleted.")
      setPosts?.((prev) => prev.filter((t) => t.id !== post.id))
    } else {
      alert("Delete failed.")
    }
  }

  async function handleShare() {
    if (sharedUrl) {
      navigator.clipboard.writeText(sharedUrl)
      alert("URL copied")
      return
    }
    setIsSharing(true)
    const res = await fetch("/api/shared", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    })
    const data = await res.json()
    if (data.success) {
      const shareUrl = window.location.origin + "/shared/" + data.shareId
      setCopyUrl(shareUrl)
    }
    setIsSharing(false)
  }

  useEffect(() => {
    if (copyUrl) {
      navigator.clipboard.writeText(copyUrl)
      alert("Shared URL copied")
    }
  }, [copyUrl])

  return (
    <Card className="text-sm p-2 shadow-md">
      <CardHeader className="pb-1">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-base font-semibold">{post.title || "Untitled Post"}</CardTitle>
            <div className="text-gray-500 text-xs">{formatDate(post.created_at)} • {post.model_used}</div>
          </div>
          {!sharedUrl && (
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <Badge className={`text-[10px] ${schemaColor}`}>{post.schema_used || "Default"}</Badge>
          <Badge className="text-[10px]">
            {publishabilityScore >= 80 ? "✅ Publishable" :
              publishabilityScore >= 50 ? "⚠️ Needs Review" :
              "❌ Not Ready"} ({publishabilityScore}%)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <div className="whitespace-pre-wrap mb-2">{post.content}</div>

        <Accordion type="single" collapsible className="mb-2">
          {post.image_suggestion && (
            <AccordionItem value="image">
              <AccordionTrigger className="text-xs"><ImageIcon className="w-4 h-4 mr-1" /> Image Suggestion</AccordionTrigger>
              <AccordionContent className="text-xs">{post.image_suggestion}</AccordionContent>
            </AccordionItem>
          )}
          {post.reasoning && (
            <AccordionItem value="reason">
              <AccordionTrigger className="text-xs">AI Reasoning</AccordionTrigger>
              <AccordionContent className="text-xs whitespace-pre-wrap">{post.reasoning}</AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="metrics">
            <AccordionTrigger className="text-xs">Details</AccordionTrigger>
            <AccordionContent className="space-y-2">
              {["engagement", "attractiveness", "interest", "relevance", "shareability", "professional"].map((key) => (
                <div key={key}>
                  <div className="flex justify-between text-xs">
                    <span>{key[0].toUpperCase() + key.slice(1)}</span>
                    <span>{Math.round(post[`${key}_score` as keyof typeof post] as number * 100)}%</span>
                  </div>
                  <Progress value={post[`${key}_score` as keyof typeof post] as number * 100} className="h-1" />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button size="icon" variant="ghost" onClick={() => {
          navigator.clipboard.writeText(post.content)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}>
          <Copy className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleShare} disabled={isSharing}>
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
