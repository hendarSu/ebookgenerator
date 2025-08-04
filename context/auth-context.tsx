"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase-client"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (email: string, password: string) => Promise<{ error: any }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          return
        }

        if (data?.session) {
          const { data: userData } = await supabase.auth.getUser()
          setUser(userData.user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error during login:", error)
      return { error }
    }
  }

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error) {
      console.error("Error during signup:", error)
      return { error }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
