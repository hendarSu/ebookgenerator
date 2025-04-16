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

export async function getProviderSettings(provider: string): Promise<AIProviderSettings | null> {
  try {
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
  } catch (error) {
    console.error("Error in getProviderSettings:", error)
    return null
  }
}

export async function saveProviderSettings(settings: AIProviderSettings): Promise<AIProviderSettings> {
  try {
    if (!settings.apiKey) {
      throw new Error("API Key is required")
    }

    // Encrypt the API key
    const encryptedApiKey = encryptText(settings.apiKey)
    console.log("Encryption successful")

    const { data, error } = await supabase
      .from("ai_provider_settings")
      .upsert(
        {
          provider: settings.provider,
          api_key: encryptedApiKey,
          model: settings.model,
          updated_at: new Date().toISOString(),
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
  } catch (error) {
    console.error("Error in saveProviderSettings:", error)
    throw error
  }
}

export async function deleteProviderSettings(provider: string): Promise<void> {
  try {
    const { error } = await supabase.from("ai_provider_settings").delete().eq("provider", provider)

    if (error) {
      console.error("Error deleting AI provider settings:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in deleteProviderSettings:", error)
    throw error
  }
}

export async function getDecryptedAPIKey(provider: string): Promise<string | null> {
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

    // Decrypt the API key
    return decryptText(data.api_key)
  } catch (error) {
    console.error("Error in getDecryptedAPIKey:", error)
    return null
  }
}
