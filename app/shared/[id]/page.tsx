"use client"
import MobilePostCard from "@/components/mobile-post-card"
import PostCard from "@/components/post-card"
import { useEffect, useState } from "react"
//shared/[id].tsx
export default function Shared(props: { params: { id: string } }) {
  const [post, setPost] = useState<
    {
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
    } | null
  >(null)
useEffect(() => {
    const fetchPost = async () => {
  const { id } = await props.params
      const response = await fetch(`/api/shared/${id}`)
      const data = await response.json()
      console.log("Fetched post data:", data)
      setPost(data.post.post)
    }

    fetchPost()
  }, [props])


  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">

        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent h-12 w-12"></div>
          <div className="text-xl font-semibold text-gray-700">Loading your post...</div>
          <div className="mt-2 text-gray-500">Please wait while we fetch the content.</div>
        </div>
      </div>
    )
  }
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches


  return (
    <div className="container mx-auto px-4 py-8">
      
        {
          isMobile ? (
            <MobilePostCard key={post.id} post={post} sharedUrl={window.location.href} />
          ) : (
            <PostCard key={post.id} post={post} sharedUrl={window.location.href} />
          )
        }
        </div>
  )
}
