"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
      applyTheme(storedTheme)
    } else {
      // Default to system theme
      applyTheme("system")
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement

    // Remove existing class
    root.classList.remove("dark", "light")

    // Apply new theme
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      localStorage.setItem("theme", newTheme)
      applyTheme(newTheme)
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return a default implementation if used outside provider
    return {
      theme: "system" as Theme,
      setTheme: (newTheme: Theme) => {
        localStorage.setItem("theme", newTheme)
        const root = window.document.documentElement
        root.classList.remove("dark", "light")

        if (newTheme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          root.classList.add(systemTheme)
        } else {
          root.classList.add(newTheme)
        }
      },
    }
  }
  return context
}
