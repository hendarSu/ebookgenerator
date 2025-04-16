"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <AuthProvider>
      <ThemeProvider>
        {/* Only render Navbar if NOT on home page */}
        {!isHomePage && <Navbar />}
        <div className={!isHomePage ? "pt-14" : ""}>{children}</div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

