"use client"

import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

// Client component to handle conditional padding
function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return <div className={isHomePage ? "" : "pt-14"}>{children}</div>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ConditionalNavbar />
      <ConditionalPadding>{children}</ConditionalPadding>
      <Toaster />
    </ThemeProvider>
  )
}
