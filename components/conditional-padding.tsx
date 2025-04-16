"use client"

import { usePathname } from "next/navigation"
import type React from "react"

export function ConditionalPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/" 
  const isLoginPage = pathname === "/login" 

  return <div className={isHomePage ? "" : isLoginPage ? "" : "pt-10" }>{children}</div>
}
