"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { createUserSettings } from "@/lib/user-settings-service"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          setSession(session)
          setUser(session.user)
        } else {
          setSession(null)
          setUser(null)

          // Allow access to public routes when not authenticated
          const publicRoutes = ["/login", "/forgot-password", "/explore", "/"]

          // Check if the current path starts with any of the public routes
          const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

          if (!isPublicRoute) {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setSession(null)
        setUser(null)

        // Redirect to login on error, except for public routes
        if (pathname !== "/login" && pathname !== "/explore" && !pathname.startsWith("/explore/")) {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session ? session.user : null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Redirect to projects page
      router.push("/projects")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        throw error
      }

      // Initialize user settings with default theme
      if (data.user) {
        await createUserSettings(data.user.id, { theme: "light" })
      }

      // After successful registration, sign in the user
      await login(email, password)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setSession(null)

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Update the useAuth function to handle the case when it's called outside the provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Instead of throwing an error, return a default context with isLoading=true
    return {
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => {
        console.error("Auth context not initialized")
      },
      register: async () => {
        console.error("Auth context not initialized")
      },
      logout: async () => {
        console.error("Auth context not initialized")
      },
    } as AuthContextType
  }
  return context
}

