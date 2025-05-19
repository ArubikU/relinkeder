import { Readability } from "@mozilla/readability";
import { search } from 'duck-duck-scrape';
import { JSDOM } from "jsdom";
export interface ScrapedContent {
  title: string
  content: string
  url: string
}

async function tryFetch(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`)

    return await response.text()
  } catch (err) {
    console.warn(`Primary fetch failed for ${url}:`, err)
    return null
  }
}
type searchType = "news" | "results" | "related" | "all"

export function isParametirizedUrl(url: string): boolean {
  if (url.startsWith("duckduckgo:")) {
    return true
  }
  return false
}

export async function scrapeFunction(url: string, limit = 5): Promise<ScrapedContent> {
  try {
    //if url starts with duckduckgo:
    const isDuckDuckGo = url.startsWith("duckduckgo:")
    if (isDuckDuckGo) {
      const searchQuery = url.replace("duckduckgo:", "")

      let searchType: searchType = "all" // or "news", "results", "related"
      //get the search type from the url
      const searchTypeMatch = searchQuery.match(/(news|results|related)/)
      if (searchTypeMatch) {
        //remove the search type from the query
        searchQuery.replace(searchTypeMatch[0], "")
        searchType = searchTypeMatch[0] as searchType
      }

      const results = await search(searchQuery)
      
      const news = results.news ?? []
      const general = results.results ?? []
      let finalResults = []
      if (searchType === "news") {
        finalResults = news
      } else if (searchType === "results") {
        finalResults = general
      } else {
        finalResults = [...news, ...general]
      }

      const packaged = []
      const limitedResults = finalResults.slice(0, limit)
      //go through the results and recolect and scrapp all posible data
      for (const result of limitedResults) {
        const html = await tryFetch(result.url)
        if (html) {
          const dom = new JSDOM(html, { url: result.url })
          const document = dom.window.document
          const reader = new Readability(document)
          const article = reader.parse()
          if (article) {
            packaged.push({
              title: article.title!,
              content: article.textContent!,
              url: result.url,
            })
          }
        }
      }
      const packagedStrign = JSON.stringify(packaged)
      return {
        title: "DuckDuckGo Search",
        content: packagedStrign,
        url,
      }
    }
    return {
      title: "No title found",
      content: "No content found",
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




export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {

    const a = await scrapeFunction(url)
    if (a.title !== "No title found") {
      return a
    }

    let html = await tryFetch(url)

    // If direct fetch failed, fallback to AllOrigins
    if (!html) {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      html = await tryFetch(proxyUrl)
      if (!html) throw new Error("Both direct and proxy fetches failed.")
    }

    // Parse HTML and extract content
    const dom = new JSDOM(html, { url })
    const document = dom.window.document
    const reader = new Readability(document)
    const article = reader.parse()

    if (!article) throw new Error("Failed to parse article content")

    return {
      title: article.title!,
      content: article.textContent!,
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
