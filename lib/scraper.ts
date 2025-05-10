import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"

export interface ScrapedContent {
  title: string
  content: string
  url: string
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()

    // Parse the HTML
    const dom = new JSDOM(html, { url })
    const document = dom.window.document

    // Use Readability to extract the main content
    const reader = new Readability(document)
    const article = reader.parse()

    if (!article) {
      throw new Error("Failed to parse article content")
    }

    return {
      title: article.title,
      content: article.textContent,
      url,
    }
  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error)
    return {
      title: "Failed to extract title",
      content: "Failed to extract content",
      url,
    }
  }
}
