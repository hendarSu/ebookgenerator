export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
          cover_image: string | null
          visibility: "public" | "private"
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          cover_image?: string | null
          visibility?: "public" | "private"
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          cover_image?: string | null
          visibility?: "public" | "private"
        }
      }
      chapters: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string | null
          order_index: number
          created_at: string
          updated_at: string
          video_url?: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
          video_url?: string | null
        }
      }
      user_settings: {
        Row: {
          user_id: string
          theme: string
          font_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          font_size?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          font_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_provider_settings: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key: string | null
          model: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          api_key?: string | null
          model?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key?: string | null
          model?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
