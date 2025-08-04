"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Menu, Plus, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthHeader } from "@/components/auth-header"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-sky-500" />
            <span className="font-bold text-xl">Sharebook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/projects"
                  className={cn(
                    "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                    isActive("/projects") && "text-sky-500 dark:text-sky-400 font-medium",
                  )}
                >
                  My Projects
                </Link>
                <Link
                  href="/explore"
                  className={cn(
                    "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                    isActive("/explore") && "text-sky-500 dark:text-sky-400 font-medium",
                  )}
                >
                  Explore
                </Link>
                <Link
                  href="/ai-settings"
                  className={cn(
                    "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                    isActive("/ai-settings") && "text-sky-500 dark:text-sky-400 font-medium",
                  )}
                >
                  AI Settings
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/projects/new">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <ThemeToggle />
                <AuthHeader />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/projects"
                    className={cn(
                      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                      isActive("/projects") && "text-sky-500 dark:text-sky-400 font-medium",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Projects
                  </Link>
                  <Link
                    href="/explore"
                    className={cn(
                      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                      isActive("/explore") && "text-sky-500 dark:text-sky-400 font-medium",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Explore
                  </Link>
                  <Link
                    href="/ai-settings"
                    className={cn(
                      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                      isActive("/ai-settings") && "text-sky-500 dark:text-sky-400 font-medium",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    AI Settings
                  </Link>
                  <Link
                    href="/settings"
                    className={cn(
                      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                      isActive("/settings") && "text-sky-500 dark:text-sky-400 font-medium",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <ThemeToggle />
                    <Link href="/projects/new" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        New Project
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/explore"
                    className={cn(
                      "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                      isActive("/explore") && "text-sky-500 dark:text-sky-400 font-medium",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Explore
                  </Link>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <ThemeToggle />
                    <div className="flex space-x-2">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        <Button size="sm" className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
