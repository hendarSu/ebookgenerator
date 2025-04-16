"use client"

import type React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProvider as CustomThemeProvider } from "@/context/theme-context"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CustomThemeProvider>
      <NextThemesProvider attribute="class" enableSystem={false} defaultTheme="light">
        {children}
      </NextThemesProvider>
    </CustomThemeProvider>
  )
}
