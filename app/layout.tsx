import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { ConditionalPadding } from "@/components/conditional-padding"

const inter = Inter({ subsets: ["latin"] })

// Update the metadata title and description
export const metadata: Metadata = {
  title: "Sharebook",
  description: "Create, manage, and share your ebooks by chapter",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ConditionalNavbar />
            <ConditionalPadding>{children}</ConditionalPadding>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'