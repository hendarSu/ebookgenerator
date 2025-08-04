"use client"

import { useState } from "react"
import Link from "next/link"
import { Book, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-sky-500" />
            <span className="font-bold text-xl">Sharebook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Testimonials
            </Link>
            <Link
              href="/explore"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Explore
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700">
                Sign Up
              </Button>
            </Link>
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
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <ThemeToggle />
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
