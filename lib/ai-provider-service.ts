import { supabase } from "@/lib/supabase-client"
import { encryptText, decryptText } from "@/lib/encryption-service"

type AIProviderSettings = {
  id?: string
  provider: string
  apiKey: string
  model: string
  created_at?: string
  updated_at?: string
}

export async function getAIProviderSettings(userId: string): Promise<AIProviderSettings[]> {
  const { data, error } = await supabase.from("ai_provider_settings").select("*")

  if (error) {
    console.error("Error fetching AI provider settings:", error)
    return []
  }

  return data as AIProviderSettings[]
}

export async function getProviderSettings(provider: string): Promise<AIProviderSettings | null> {
  const { data, error } = await supabase.from("ai_provider_settings").select("*").eq("provider", provider).single()

  if (error) {
    if (error.code === "PGRST116") {
      // No settings found
      return null
    }
    console.error("Error fetching AI provider settings:", error)
    throw error
  }

  return data as AIProviderSettings
}

export async function saveProviderSettings(settings: AIProviderSettings): Promise<AIProviderSettings> {
  if (!settings.apiKey) {
    throw new Error("API Key is required")
  }

  const encryptedApiKey = encryptText(settings.apiKey)

  const { data, error } = await supabase
    .from("ai_provider_settings")
    .upsert(
      {
        provider: settings.provider,
        api_key: encryptedApiKey,
        model: settings.model,
      },
      { onConflict: "provider" },
    )
    .select("*")
    .single()

  if (error) {
    console.error("Error saving AI provider settings:", error)
    throw error
  }

  return data as AIProviderSettings
}

export async function deleteProviderSettings(provider: string): Promise<void> {
  const { error } = await supabase.from("ai_provider_settings").delete().eq("provider", provider)

  if (error) {
    console.error("Error deleting AI provider settings:", error)
    throw error
  }
}

export async function getDecryptedAPIKey(userId: string, provider: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("ai_provider_settings")
      .select("api_key")
      .eq("provider", provider)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found
        return null
      }
      console.error("Error fetching AI provider settings:", error)
      return null
    }

    if (!data?.api_key) {
      return null
    }

    return decryptText(data.api_key)
  } catch (error) {
    console.error("Error decrypting API key:", error)
    return null
  }
}
