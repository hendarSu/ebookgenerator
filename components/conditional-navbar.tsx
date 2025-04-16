"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  if (isHomePage) {
    return null
  }

  return <Navbar />
}
