"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { ProjectList } from "@/components/project-list"
import { useAuth } from "../../context/auth-context"
import { Input } from "@/components/ui/input"

export default function ProjectsPage() {
  // Always call hooks at the top level, regardless of conditions
  const { isAuthenticated, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")

  // Use useEffect to mark when the component has mounted
  useEffect(() => {
    setIsMounted(true)

    // Redirect to login if not authenticated (after mounting)
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login"
    }
  }, [isLoading, isAuthenticated])

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL with search parameters
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    router.push(`/projects?${params.toString()}`)
  }

  // Show loading state until the component is mounted and auth is checked
  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated after loading, return null (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Show projects when authenticated and loaded
  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Sharebook Projects</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and edit your ebooks by chapter</p>
        </div>

        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your ebooks..."
              className="pl-10 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
        <ProjectList searchTerm={searchTerm} />
      </div>
    </div>
  )
}
