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
import { TextEditor } from "@/components/text-editor"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // Add a new state for the video URL
  const [videoUrl, setVideoUrl] = useState("")

  // Fetch chapter data
  useEffect(() => {
    // Update the loadChapter function to set the video URL
    async function loadChapter() {
      try {
        setLoading(true)

        const { data, error } = await supabase.from("chapters").select("*").eq("id", chapterId).single()

        if (error) {
          console.error("Error loading chapter:", error)
          toast({
            title: "Error",
            description: "Failed to load chapter data. Please try again.",
            variant: "destructive",
          })
          return
        }

        setTitle(data.title)
        setContent(data.content || "")
        setVideoUrl(data.video_url || "")
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadChapter()
  }, [chapterId, toast])

  // Update the handleSubmit function to include the video URL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)
    try {
      const { error } = await supabase
        .from("chapters")
        .update({
          title,
          content,
          video_url: videoUrl,
        })
        .eq("id", chapterId)

      if (error) {
        throw error
      }

      toast({
        title: "Chapter updated",
        description: "Your chapter has been updated successfully.",
      })

      // Redirect back to the project page
      router.push(`/demo/projects/${projectId}`)
    } catch (error) {
      console.error("Error updating chapter:", error)
      toast({
        title: "Error",
        description: "Failed to update chapter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-3 md:py-6 md:px-4 lg:py-10 lg:px-6 w-full">
      <div className="flex items-center mb-4">
        <Link href={`/demo/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>

      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Chapter</h1>
        <p className="text-muted-foreground mt-1">Update your chapter content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Empty for consistency with detail page */}
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
                <Button variant="outline" type="button" onClick={() => router.push(`/demo/projects/${projectId}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !title}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
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

