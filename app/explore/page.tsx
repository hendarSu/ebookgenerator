"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Book, ChevronRight, ChevronLeft, Loader2, LogIn } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getPublicProjects } from "@/lib/project-service"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/context/auth-context"

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page") || 1))
  const projectsPerPage = 12

  useEffect(() => {
    async function fetchPublicProjects() {
      try {
        setLoading(true)
        const { data, count } = await getPublicProjects(searchTerm, projectsPerPage, currentPage)

        setProjects(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error("Error fetching public projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicProjects()
  }, [searchTerm, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)

    // Update URL with search parameters
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    params.set("page", "1")
    router.push(`/explore?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)

    // Update URL with page parameter
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`/explore?${params.toString()}`)
  }

  const totalPages = Math.ceil(totalCount / projectsPerPage)

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Sharebooks</h1>
          <p className="text-muted-foreground mt-1">Discover public ebooks created by the community</p>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ebooks..."
                className="pl-10 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>

          {!isAuthenticated && (
            <Link href="/login">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading ebooks...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center p-10">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Book className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No ebooks found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No results found for "${searchTerm}". Try a different search term.`
                : "There are no public ebooks available yet."}
            </p>
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                router.push("/explore")
              }}
            >
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                {project.cover_image && (
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src={project.cover_image || "/placeholder.svg?height=160&width=320"}
                      alt={`Cover for ${project.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className={project.cover_image ? "pt-4" : ""}>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Public</Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex justify-end w-full">
                    <Link href={isAuthenticated ? `/projects/${project.id}` : "/login"}>
                      <Button variant="ghost" size="sm">
                        {isAuthenticated ? (
                          <>
                            View
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Sign in to view
                            <LogIn className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

