"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Globe, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/file-upload"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getProject, updateProject, uploadCoverImage, deleteCoverImage } from "@/lib/project-service"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const projectId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [originalCoverUrl, setOriginalCoverUrl] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch project data
  useEffect(() => {
    async function loadProject() {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        const project = await getProject(projectId)

        setTitle(project.title)
        setDescription(project.description || "")
        setIsPublic(project.visibility === "public")
        if (project.cover_image) {
          setCoverImage(project.cover_image)
          setOriginalCoverUrl(project.cover_image)
        }
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

    loadProject()
  }, [projectId, isAuthenticated, toast])

  const handleCoverUpload = (file: File) => {
    setCoverFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      // Handle cover image changes
      let newCoverUrl = originalCoverUrl

      // If cover was removed
      if (originalCoverUrl && !coverImage) {
        await deleteCoverImage(originalCoverUrl)
        newCoverUrl = null
      }

      // If new cover was uploaded
      if (coverFile) {
        // Delete old cover if exists
        if (originalCoverUrl) {
          await deleteCoverImage(originalCoverUrl)
        }
        newCoverUrl = await uploadCoverImage(coverFile, user.id)
      }

      await updateProject(projectId, {
        title,
        description,
        cover_image: newCoverUrl,
        visibility: isPublic ? "public" : "private", // Update visibility
      })

      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      })

      // Redirect back to the project page
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">Update your project details</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Edit the basic information for your ebook project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ebook Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your ebook"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is your ebook about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image (Optional)</Label>
              <FileUpload
                value={coverImage}
                onChange={setCoverImage}
                onFile={handleCoverUpload}
                accept="image/*"
                maxSize={2} // 2MB limit
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="visibility" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="visibility" className="flex items-center gap-2">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Public - Anyone can view this ebook</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Private - Only you can view this ebook</span>
                  </>
                )}
              </Label>
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
  )
}

