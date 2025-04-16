"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Menu, X, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function LandingNavbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Track scroll position to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Define navigation items
  const navItems = [
    {
      name: "Features",
      href: "#features",
    },
    {
      name: "How It Works",
      href: "#how-it-works",
    },
    {
      name: "Testimonials",
      href: "#testimonials",
    },
    {
      name: "Explore",
      href: "/explore",
    },
  ]

  // Function to close the mobile menu
  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-200",
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Book className="h-6 w-6 text-sky-500 dark:text-sky-400" />
          <span className="font-bold text-lg">Sharebook</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Support Button */}
          <a
            href="https://saweria.co/minipos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            Support
          </a>

          <ThemeToggle />

          <div className="flex items-center space-x-2">
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(true)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-sky-500 dark:text-sky-400" />
                    <span className="font-bold">Sharebook</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeMenu}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Support Button in Mobile Menu */}
                  <a
                    href="https://saweria.co/minipos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center py-2 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors"
                    onClick={closeMenu}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Support
                  </a>
                </nav>

                <div className="mt-auto border-t pt-4 flex flex-col gap-3">
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/login" onClick={closeMenu}>
                    <Button className="w-full bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

