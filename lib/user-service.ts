import { supabase } from "./supabase-client"
import { createServerSupabaseClient } from "./supabase"

export interface UserProfile {
  id: string
  full_name: string
  avatar_url?: string
  email?: string
  created_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Get user data from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      console.error("Error fetching user:", userError)
      return null
    }

    // Extract relevant user information
    const userProfile: UserProfile = {
      id: userData.user.id,
      full_name: userData.user.user_metadata?.full_name || "Anonymous User",
      email: userData.user.email,
      avatar_url: userData.user.user_metadata?.avatar_url,
      created_at: userData.user.created_at,
    }

    return userProfile
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

export async function getUserProjects(userId: string, limit = 10) {
  try {
    const { data, error, count } = await supabase
      .from("projects")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("visibility", "public") // Only fetch public projects
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching user projects:", error)
      throw error
    }

    return { data, count }
  } catch (error) {
    console.error("Error in getUserProjects:", error)
    throw error
  }
}

// Improved function to get author information for a project
export async function getBasicUserInfo(userId: string): Promise<UserProfile | null> {
  try {
    // First try to get user info from the users table
    try {
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (!userError && userData) {
        return {
          id: userId,
          full_name: userData.display_name || userData.full_name || "Unknown Author",
          avatar_url: userData.avatar_url,
          created_at: userData.created_at || new Date().toISOString(),
        }
      }
    } catch (e) {
      console.error("Error fetching user data from users table:", e)
    }

    // If not found in users table, try to get from auth directly using server client
    try {
      const serverClient = createServerSupabaseClient()
      const { data: authUser, error: authError } = await serverClient.auth.admin.getUserById(userId)

      if (!authError && authUser?.user) {
        return {
          id: userId,
          full_name:
            authUser.user.user_metadata?.display_name ||
            authUser.user.user_metadata?.full_name ||
            (authUser.user.email ? authUser.user.email.split("@")[0] : "Unknown Author"),
          email: authUser.user.email,
          avatar_url: authUser.user.user_metadata?.avatar_url,
          created_at: authUser.user.created_at,
        }
      }
    } catch (e) {
      console.error("Error fetching user data from auth admin:", e)
    }

    // Try with regular auth as fallback
    try {
      const { data } = await supabase.auth.getUser()

      // If current user is the requested user, return their info
      if (data?.user && data.user.id === userId) {
        return {
          id: data.user.id,
          full_name:
            data.user.user_metadata?.display_name ||
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Unknown Author",
          email: data.user.email,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        }
      }
    } catch (e) {
      console.error("Error fetching current user data:", e)
    }

    // As a last resort, try to get the user directly from the projects table
    try {
      const { data: projects } = await supabase.from("projects").select("user_id").eq("user_id", userId).limit(1)

      if (projects && projects.length > 0) {
        // We found a project by this user, but couldn't get their name
        // Return a minimal profile with a better fallback name
        return {
          id: userId,
          full_name: "Project Author", // Better than just "Author"
          created_at: new Date().toISOString(),
        }
      }
    } catch (e) {
      console.error("Error checking projects for user:", e)
    }

    // If we got here, we couldn't find any information about the user
    return null
  } catch (error) {
    console.error("Error in getBasicUserInfo:", error)
    return null
  }
}
