import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "../context/auth-context"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "Sharebook - Create and Share Ebooks",
  description: "Create, manage, and share your ebooks with the world",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
