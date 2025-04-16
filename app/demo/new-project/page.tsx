"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const handleCoverUpload = (file: File) => {
    setCoverFile(file)
  }

  // Update the handleSubmit function to ensure we're using the current user's ID
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a project",
          variant: "destructive",
        })
        return
      }

      // Upload cover image if provided
      let coverImageUrl = null
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `covers/${fileName}`

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage.from("project-covers").upload(filePath, coverFile)

        if (uploadError) {
          console.error("Error uploading cover image:", uploadError)
          throw uploadError
        }

        // Get the public URL
        const { data } = supabase.storage.from("project-covers").getPublicUrl(filePath)

        coverImageUrl = data.publicUrl
      }

      // Create the project in Supabase
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          user_id: user.id, // Ensure we're using the current user's ID
          cover_image: coverImageUrl,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Project created",
        description: "Your new ebook project has been created successfully.",
      })

      // Redirect to the projects page
      router.push("/demo")
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex items-center mb-4">
        <Link href="/demo">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Ebook Project</h1>
        <p className="text-muted-foreground mt-1">Enter the details for your new ebook</p>
      </div>

      <Card className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Enter the basic information for your new ebook project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-auto">
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/demo")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
