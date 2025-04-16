import { supabase } from "./supabase-client"

export interface UserSettings {
  theme: string
  font_size: number
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error) {
      // If no settings found, return null
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return null
  }
}

export async function createUserSettings(
  userId: string,
  settings: Partial<UserSettings> = {},
): Promise<UserSettings | null> {
  try {
    // Default settings
    const defaultSettings = {
      theme: "light",
      font_size: 16,
      ...settings,
    }

    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        ...defaultSettings,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error creating user settings:", error)
    return null
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>,
): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error updating user settings:", error)
    return null
  }
}

export async function updateUserTheme(userId: string, theme: string): Promise<boolean> {
  try {
    // First check if user settings exist
    const settings = await getUserSettings(userId)

    if (!settings) {
      // Create settings with the specified theme
      await createUserSettings(userId, { theme })
    } else {
      // Update existing settings
      await updateUserSettings(userId, { theme })
    }

    return true
  } catch (error) {
    console.error("Error updating user theme:", error)
    return false
  }
}
