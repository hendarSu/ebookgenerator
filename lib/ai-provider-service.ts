import { supabase } from "./supabase-client"
import { encryptText, decryptText } from "./encryption-service"

export interface ProviderSettings {
  apiKey?: string
  model?: string
}

async function getUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id || null
}

export async function getProviderSettings(provider: string): Promise<ProviderSettings | null> {
  try {
    const userId = await getUserId()
    if (!userId) return null

    const { data, error } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single()

    if (error) {
      // If no settings found, return null
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    // Decrypt API key if it exists
    let apiKey = data?.api_key || null
    if (apiKey) {
      apiKey = decryptText(apiKey)
    }

    return {
      apiKey: apiKey,
      model: data?.model || "gpt-3.5-turbo",
    }
  } catch (error) {
    console.error(`Error fetching ${provider} settings:`, error)
    return null
  }
}

export async function saveProviderSettings(provider: string, settings: ProviderSettings): Promise<boolean> {
  try {
    const userId = await getUserId()
    if (!userId) throw new Error("User not authenticated")

    // Encrypt API key before saving
    const encryptedApiKey = settings.apiKey ? encryptText(settings.apiKey) : null

    const { error } = await supabase.from("ai_provider_settings").upsert(
      {
        user_id: userId,
        provider: provider,
        api_key: encryptedApiKey,
        model: settings.model,
      },
      { onConflict: "user_id, provider" },
    )

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error saving ${provider} settings:`, error)
    throw error
  }
}

export async function deleteProviderSettings(provider: string): Promise<boolean> {
  try {
    const userId = await getUserId()
    if (!userId) throw new Error("User not authenticated")

    const { error } = await supabase
      .from("ai_provider_settings")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error deleting ${provider} settings:`, error)
    throw error
  }
}

export async function getDecryptedAPIKey(userId: string, provider: string): Promise<string | null> {
  try {
    console.log(`Fetching API key for user ${userId} and provider ${provider}`)

    const { data, error } = await supabase
      .from("ai_provider_settings")
      .select("api_key")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single()

    if (error) {
      // If no settings found, return null
      if (error.code === "PGRST116") {
        console.log(`No API key found for ${provider}`)
        return null
      }
      console.error(`Error fetching ${provider} API key:`, error)
      return null
    }

    const encryptedApiKey = data?.api_key
    if (!encryptedApiKey) {
      console.log(`API key is null or empty for ${provider}`)
      return null
    }

    const decryptedKey = decryptText(encryptedApiKey)
    console.log(`API key decrypted successfully for ${provider}: ${decryptedKey ? "Key exists" : "Key is empty"}`)

    return decryptedKey
  } catch (error) {
    console.error(`Error decrypting ${provider} API key:`, error)
    return null
  }
}
