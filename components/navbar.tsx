"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Globe, Menu, X, Home, PlusCircle, Heart, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AuthHeader } from "@/components/auth-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

export function Navbar() {
  const { isAuthenticated } = useAuth()
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
      name: "Home",
      href: "/projects",
      icon: <Home className="h-4 w-4 mr-2" />,
      active: pathname === "/projects",
      authRequired: true,
    },
    {
      name: "Explore",
      href: "/explore",
      icon: <Globe className="h-4 w-4 mr-2" />,
      active: pathname === "/explore",
      authRequired: false,
    },
    {
      name: "AI Settings",
      href: "/ai-settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
      active: pathname === "/ai-settings",
      authRequired: true,
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
      <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={isAuthenticated ? "/projects" : "/"} className="flex items-center gap-2">
          <Book className="h-6 w-6 text-sky-500" />
          <span className="font-bold text-lg">Sharebook</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems
            .filter((item) => !item.authRequired || (item.authRequired && isAuthenticated))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors",
                  item.active ? "text-sky-500" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

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

          {isAuthenticated && (
            <Link href="/projects/new">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Ebook
              </Button>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <AuthHeader />
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle */}
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
                    <Book className="h-5 w-5 text-sky-500" />
                    <span className="font-bold">Sharebook</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeMenu}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>

                <nav className="flex flex-col gap-4 mt-6">
                  {navItems
                    .filter((item) => !item.authRequired || (item.authRequired && isAuthenticated))
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center py-2 text-sm font-medium transition-colors",
                          item.active ? "text-sky-500" : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={closeMenu}
                      >
                        {item.icon}
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

                  {isAuthenticated && (
                    <Link href="/projects/new" className="mt-2" onClick={closeMenu}>
                      <Button className="w-full bg-sky-500 hover:bg-sky-600">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Ebook
                      </Button>
                    </Link>
                  )}
                </nav>

                <div className="mt-auto border-t pt-4">
                  {isAuthenticated ? (
                    <div className="flex justify-center">
                      <AuthHeader />
                    </div>
                  ) : (
                    <Link href="/login" onClick={closeMenu}>
                      <Button className="w-full bg-sky-500 hover:bg-sky-600">Login</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
