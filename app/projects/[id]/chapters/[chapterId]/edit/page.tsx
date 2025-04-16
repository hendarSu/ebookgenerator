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
import { getChapter, updateChapter } from "@/lib/chapter-service"
import { TextEditor } from "@/components/text-editor"
import { createChapter } from "@/lib/chapter-service"
import { supabase } from "@/lib/supabase-client"

interface EditChapterPageProps {
  params: {
    id: string
    chapterId: string
  }
}

export default function EditChapterPage({ params }: EditChapterPageProps) {
  const { id: projectId, chapterId } = params
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [authError, setAuthError] = useState(false)
  const auth = useAuth()
  const { isAuthenticated, isLoading, user } = auth

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, mounted])

  // Fetch chapter data
  useEffect(() => {
    async function loadChapter() {
      if (!mounted || !isAuthenticated) return

      // Skip fetching if we're creating a new chapter
      if (chapterId === "new") {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const chapter = await getChapter(chapterId)

        setTitle(chapter.title)
        setContent(chapter.content || "")
        setVideoUrl(chapter.video_url || "")
      } catch (err) {
        console.error("Error loading chapter:", err)
        toast({
          title: "Error",
          description: "Failed to load chapter data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadChapter()
  }, [chapterId, isAuthenticated, toast, mounted])

  // Update the handleSubmit function to include the video URL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setAuthError(true)
      return
    }

    setSaving(true)
    try {
      if (chapterId === "new") {
        // Get the count of existing chapters to determine the order_index
        const { data: existingChapters } = await supabase.from("chapters").select("id").eq("project_id", projectId)

        const orderIndex = existingChapters?.length || 0

        // Create a new chapter
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
      } else {
        // Update existing chapter
        await updateChapter(chapterId, {
          title,
          content,
          video_url: videoUrl,
        })

        toast({
          title: "Chapter updated",
          description: "Your chapter has been updated successfully.",
        })
      }

      // Redirect back to the project page
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error(`Error ${chapterId === "new" ? "creating" : "updating"} chapter:`, error)
      toast({
        title: "Error",
        description: `Failed to ${chapterId === "new" ? "create" : "update"} chapter. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Show loading state
  if (!mounted || isLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // Show auth error
  if (authError) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Error</CardTitle>
            <CardDescription className="text-center">
              You need to be logged in to edit chapters. Please log in and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardFooter>
        </Card>
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
        <h1 className="text-2xl md:text-3xl font-bold">{chapterId === "new" ? "Add New Chapter" : "Edit Chapter"}</h1>
        <p className="text-muted-foreground mt-1">
          {chapterId === "new" ? "Create a new chapter for your ebook" : "Update your chapter content"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="md:col-span-4">
          <Card className="shadow-sm w-full flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
                <CardDescription>Edit the title and content for this chapter</CardDescription>
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
                    title={title}
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
                      {chapterId === "new" ? "Creating..." : "Saving..."}
                    </>
                  ) : chapterId === "new" ? (
                    "Create Chapter"
                  ) : (
                    "Save Changes"
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

