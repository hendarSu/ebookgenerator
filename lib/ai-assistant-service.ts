import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getDecryptedAPIKey } from "./ai-provider-service"

export type AssistantMode = "writer" | "editor" | "researcher" | "summarizer" | "translator"

export async function streamAssistantResponse(
  prompt: string,
  mode: AssistantMode,
  context: string | undefined,
  onChunk: (chunk: string) => void,
  userId: string,
  provider: "openai" | "gemini" = "openai",
) {
  let fullPrompt = `You are a helpful AI assistant. Your current mode is ${mode}.`

  if (context) {
    fullPrompt += `\n\nContext: ${context}`
  }

  fullPrompt += `\n\nUser Prompt: ${prompt}`
  fullPrompt += `\n\nResponse:`

  try {
    // Get the decrypted API key for the specified provider
    const apiKey = await getDecryptedAPIKey(userId, provider)

    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your API key in settings.`)
    }

    // Currently only supporting OpenAI
    // We'll use OpenAI for both providers until Gemini is properly supported
    const model = openai("gpt-4o", { apiKey })

    const response = await generateText({
      model,
      prompt: fullPrompt,
      temperature: 0.7,
      onStream: (chunk) => {
        onChunk(chunk)
      },
    })

    return response.text
  } catch (error) {
    console.error("Error streaming assistant response:", error)
    throw error
  }
}

// Update other functions similarly to use the decrypted API key
export async function generateChapterIdeas(
  bookTitle: string,
  bookDescription: string,
  userId: string,
  provider: "openai" | "gemini" = "openai",
  chapterCount = 5,
) {
  const prompt = `
    Create an outline for a book titled "${bookTitle}" about "${bookDescription}".
    Generate ${chapterCount} chapters with titles and brief descriptions.
    Format the response as a JSON array of objects, each with 'title' and 'description' properties.
    Make the titles engaging and the descriptions informative but concise.
  `

  try {
    // Get the decrypted API key
    const apiKey = await getDecryptedAPIKey(userId, provider)

    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your API key in settings.`)
    }

    // Currently only supporting OpenAI
    const model = openai("gpt-4o", { apiKey })

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    const chapters = JSON.parse(text)
    return chapters
  } catch (error) {
    console.error("Error generating chapter ideas:", error)
    // Return a fallback set of chapters
    return Array.from({ length: chapterCount }, (_, i) => ({
      title: `Chapter ${i + 1}`,
      description: "Chapter description will go here.",
    }))
  }
}

export async function improveText(
  text: string,
  instruction: string,
  userId: string,
  provider: "openai" | "gemini" = "openai",
) {
  const prompt = `
    Improve the following text according to this instruction: "${instruction}"
    
    Text to improve:
    "${text}"
    
    Return only the improved text without any additional explanations.
  `

  try {
    // Get the decrypted API key
    const apiKey = await getDecryptedAPIKey(userId, provider)

    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your API key in settings.`)
    }

    // Currently only supporting OpenAI
    const model = openai("gpt-4o", { apiKey })

    const { text: improvedText } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    })

    return improvedText
  } catch (error) {
    console.error("Error improving text:", error)
    return text
  }
}

export async function generateContent(prompt: string, userId: string, provider: "openai" | "gemini" = "openai") {
  try {
    // Get the decrypted API key
    const apiKey = await getDecryptedAPIKey(userId, provider)

    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Please configure your API key in settings.`)
    }

    // Currently only supporting OpenAI
    const model = openai("gpt-4o", { apiKey })

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    })

    return text
  } catch (error) {
    console.error("Error generating content:", error)
    return "Content generation failed. Please try again."
  }
}
