"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Book, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export default function DemoPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error("No user logged in")
          return
        }

        // Fetch projects for the current user
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (projectsError) {
          console.error("Error fetching projects:", projectsError)
          return
        }

        // For each project, fetch the chapter count
        const projectsWithChapterCounts = await Promise.all(
          projectsData.map(async (project) => {
            const { count, error: chaptersError } = await supabase
              .from("chapters")
              .select("id", { count: "exact" })
              .eq("project_id", project.id)

            if (chaptersError) {
              console.error(`Error fetching chapters for project ${project.id}:`, chaptersError)
              return { ...project, chapterCount: 0 }
            }

            return { ...project, chapterCount: count || 0 }
          }),
        )

        setProjects(projectsWithChapterCounts)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Sharebook Projects</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and edit your ebooks by chapter</p>
        </div>
        <Link href="/demo/new-project">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ebook Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-10">
          <div className="flex flex-col items-center gap-2 mb-6">
            <Book className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No ebook projects yet</h3>
            <p className="text-muted-foreground">Create your first ebook project to get started</p>
          </div>
          <Link href="/demo/new-project">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Ebook
            </Button>
          </Link>
        </Card>
      ) : (
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
                  <Badge variant="outline">{project.chapterCount} chapters</Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex justify-between w-full">
                  <Link href={`/demo/projects/${project.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/demo/projects/${project.id}`}>
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
      )}
    </div>
  )
}
