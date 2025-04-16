"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Book, ChevronRight, Clock, Edit, PlusCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { getProjects } from "@/lib/project-service"
import { getChapters } from "@/lib/chapter-service"
import { formatDistanceToNow } from "date-fns"

interface ProjectWithChapterCount {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  chapterCount: number
  cover_image?: string | null
}

interface ProjectListProps {
  searchTerm?: string
}

export function ProjectList({ searchTerm = "" }: ProjectListProps) {
  const { isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<ProjectWithChapterCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProjects() {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const projectsData = await getProjects()

        // Get chapter counts for each project
        const projectsWithChapterCounts = await Promise.all(
          projectsData.map(async (project) => {
            const chapters = await getChapters(project.id)
            return {
              ...project,
              chapterCount: chapters.length,
            }
          }),
        )

        // Filter projects by search term if provided
        const filteredProjects = searchTerm
          ? projectsWithChapterCounts.filter(
              (project) =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())),
            )
          : projectsWithChapterCounts

        setProjects(filteredProjects)
      } catch (err) {
        console.error("Error loading projects:", err)
        setError("Failed to load projects. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [isAuthenticated, searchTerm])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="px-4 py-2">
              <Skeleton className="h-4 w-1/2 mb-4" />
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-4 py-2 md:px-6 md:py-3">
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center p-10">
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center p-10">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Book className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">No ebook projects yet</h3>
          <p className="text-muted-foreground">Create your first ebook project to get started</p>
        </div>
        {isAuthenticated ? (
          <Link href="/projects/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Ebook
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button>Login to Create Ebooks</Button>
          </Link>
        )}
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          {project.cover_image && (
            <div className="w-full h-40 overflow-hidden">
              <img
                src={project.cover_image || "/placeholder.svg"}
                alt={`Cover for ${project.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className={project.cover_image ? "pt-3 md:pt-4 px-4 pb-2" : "px-4 pb-2"}>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{project.chapterCount} chapters</Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-4 py-2 md:px-6 md:py-3">
            <div className="flex justify-between w-full">
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Link href={`/projects/${project.id}`}>
                <Button variant="ghost" size="sm">
                  View
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
