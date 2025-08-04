import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Create a single supabase client for the entire application
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()

// Server-side client with service role for admin operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}
