"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserSettings, updateUserTheme } from "@/lib/user-settings-service"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const { user, isAuthenticated } = useAuth()

  // Load user's theme preference when authenticated
  useEffect(() => {
    async function loadUserTheme() {
      if (isAuthenticated && user) {
        const settings = await getUserSettings(user.id)
        if (settings && settings.theme) {
          setTheme(settings.theme as Theme)
        }
      }
    }

    loadUserTheme()
  }, [isAuthenticated, user])

  // Update theme in localStorage and apply it to the document
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      localStorage.setItem("theme", "system")
    } else {
      root.classList.add(theme)
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  // Update user's theme preference in the database
  useEffect(() => {
    async function updateThemePreference() {
      if (isAuthenticated && user && theme !== "system") {
        await updateUserTheme(user.id, theme)
      }
    }

    updateThemePreference()
  }, [theme, isAuthenticated, user])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
