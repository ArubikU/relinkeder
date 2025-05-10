"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCustomAlerts } from "@/hooks/use-custom-alerts"
import { Trash2, TrendingUp } from "lucide-react"
import React from "react"

interface Topic {
  id: number
  title: string
  description: string
}

interface TopicCardProps {
  topic: Topic
  onGeneratePosts: () => void
  isGenerating: boolean
  setTopics?: React.Dispatch<React.SetStateAction<Topic[]>>
}

export default function TopicCard({ topic, onGeneratePosts, isGenerating, setTopics }: TopicCardProps) {
  const { alert, confirm, either } = useCustomAlerts();
  async function onDelete() {
    console.log("Deleting topic:", topic.id)
    const confirmed = await confirm("Are you sure you want to delete this topic?");
    if (confirmed) {
      // Call the delete topic API
      fetch("/api/topics", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topicId: topic.id }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Topic deleted successfully")
            if(setTopics) {
              setTopics((prevTopics) => prevTopics.filter((t) => t.id !== topic.id))
            }
          } else {
            alert("Failed to delete topic")
          }
        })
    }
  }

  return (
    <Card className="relinkeder-feed-item h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{topic.title}</CardTitle>
            </div>
          </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10"
              aria-label="Delete topic"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          
        </div>
      </CardHeader>
      <CardContent className="flex-grow py-2">
        <p className="text-[#666666]">{topic.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={onGeneratePosts} disabled={isGenerating} className="w-full rounded-full">
          {isGenerating ? "Generating Posts..." : "Generate Posts"}
        </Button>
      </CardFooter>
    </Card>
  )
}
