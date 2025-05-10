"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from "lucide-react"
import { useState } from "react"

interface ReferenceLinksInputProps {
  onSave: (links: string[]) => void
  initialLinks?: string[]
}

export default function ReferenceLinksInput({ onSave, initialLinks = [] }: ReferenceLinksInputProps) {
  const [links, setLinks] = useState<string[]>(initialLinks)
  const [currentLink, setCurrentLink] = useState("")

  const addLink = () => {
    if (currentLink && isValidUrl(currentLink)) {
      const newLinks = [...links, currentLink]
      setLinks(newLinks)
      setCurrentLink("")
      onSave(newLinks)
    }
  }

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index)
    setLinks(newLinks)
    onSave(newLinks)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLink()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={currentLink}
          onChange={(e) => setCurrentLink(e.target.value)}
          placeholder="https://example.com/article"
          className="relinkeder-input"
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          onClick={addLink}
          disabled={!currentLink || !isValidUrl(currentLink)}
          className="shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {links.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Reference Links:</p>
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li key={index} className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-blue-600 hover:underline"
                >
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
