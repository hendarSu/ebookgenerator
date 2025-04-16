import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateEbookContent(prompt: string, chapterCount = 5) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate an ebook outline based on the following description: "${prompt}". 
      
      Please provide:
      1. A catchy title for the ebook
      2. A compelling description (2-3 sentences)
      3. An outline with ${chapterCount} chapters (title and brief description for each)
      
      Format the response as JSON with the following structure:
      {
        "title": "Ebook Title",
        "description": "Ebook description here",
        "chapters": [
          {
            "title": "Chapter 1 Title",
            "description": "Brief description of chapter content"
          },
          ...
        ]
      }`,
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Error generating content:", error)
    throw error
  }
}

export async function generateChapterContent(chapterTitle: string, chapterDescription: string, prompt: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Write a detailed chapter for an ebook with the following details:
      
      Chapter Title: ${chapterTitle}
      Chapter Description: ${chapterDescription}
      Additional Context: ${prompt}
      
      Write a well-structured, engaging chapter that is at least 1000 words. Include appropriate headings, paragraphs, and transitions.`,
    })

    return text
  } catch (error) {
    console.error("Error generating chapter content:", error)
    throw error
  }
}
