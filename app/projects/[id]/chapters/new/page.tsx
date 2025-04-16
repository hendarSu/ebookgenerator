"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getProject } from "@/lib/project-service"
import { createChapter } from "@/lib/chapter-service"
import { TextEditor } from "@/components/text-editor"
import { supabase } from "@/lib/supabase"

interface NewChapterPageProps {
  params: {
    id: string
  }
}

export default function NewChapterPage({ params }: NewChapterPageProps) {
  const projectId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // Add a new state for the video URL
  const [videoUrl, setVideoUrl] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch project data
  useEffect(() => {
    async function loadProjectData() {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const projectData = await getProject(projectId)
        setProject(projectData)
      } catch (err) {
        console.error("Error loading project:", err)
        toast({
          title: "Error",
          description: "Failed to load project data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [projectId, isAuthenticated, toast])

  // Update the handleSubmit function to include the video URL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    setSaving(true)
    try {
      // Get the count of existing chapters to determine the order_index
      const { data: existingChapters } = await supabase.from("chapters").select("id").eq("project_id", projectId)

      const orderIndex = existingChapters?.length || 0

      await createChapter({
        project_id: projectId,
        title,
        content,
        video_url: videoUrl,
        order_index: orderIndex,
      })

      toast({
        title: "Chapter created",
        description: "Your new chapter has been created successfully.",
      })

      // Redirect back to the project page
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Error creating chapter:", error)
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  // Show message if project not found
  if (!project) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-6">
            <CardHeader>
              <CardTitle>Project Not Found</CardTitle>
              <CardDescription>
                The project you're looking for doesn't exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/projects">
                <Button>Go to Projects</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-3 md:py-6 md:px-4 lg:py-10 lg:px-6 w-full">
      <div className="flex items-center mb-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>

      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Add New Chapter</h1>
        <p className="text-muted-foreground mt-1">
          Adding a new chapter to <span className="font-medium">{project.title}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Empty for consistency with detail page */}
        <div className="md:col-span-1">{/* Placeholder for sidebar */}</div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card className="shadow-sm w-full flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
                <CardDescription>Enter the title and content for your new chapter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for this chapter"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="Enter a YouTube or Vimeo URL for chapter preview"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a video explanation or preview for this chapter. Supports YouTube and Vimeo links.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Chapter Content</Label>
                  <TextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your chapter content here..."
                    className="flex-1 min-h-[50vh]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.push(`/projects/${projectId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !title}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Chapter"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

