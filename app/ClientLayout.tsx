"use client"

import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

// Client component to handle conditional padding
function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAuthPage =
    pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password"

  return <div className={isHomePage || isAuthPage ? "" : "pt-14"}>{children}</div>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAuthPage =
    pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password"

  return (
    <ThemeProvider>
      {!isHomePage && !isAuthPage && <Navbar />}
      <ConditionalPadding>{children}</ConditionalPadding>
      <Toaster />
    </ThemeProvider>
  )
}
