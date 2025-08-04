"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const isAuthPage =
    pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/reset-password"

  // Don't render navbar on home page or auth pages
  if (isHomePage || isAuthPage) {
    return null
  }

  return <Navbar />
}
