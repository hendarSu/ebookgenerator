"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, Globe, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { Switch } from "@/components/ui/switch"
import { generateChapterIdeas } from "@/lib/ai-assistant-service"
import { createProject, uploadCoverImage } from "@/lib/project-service"
import { createChapter } from "@/lib/chapter-service"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [prompt, setPrompt] = useState("")
  const [chapterCount, setChapterCount] = useState(5)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [generatedChapters, setGeneratedChapters] = useState<Array<{ title: string; description: string }>>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Upload cover image if provided
      let coverImageUrl = null
      if (coverFile) {
        coverImageUrl = await uploadCoverImage(coverFile, user.id)
      }

      // Create the project in Supabase
      const newProject = await createProject({
        title,
        description,
        user_id: user.id,
        cover_image: coverImageUrl,
        visibility: isPublic ? "public" : "private", // Set visibility based on toggle
      })

      // If we have generated chapters, create them too
      if (generatedChapters.length > 0) {
        await Promise.all(
          generatedChapters.map((chapter, index) =>
            createChapter({
              project_id: newProject.id,
              title: chapter.title,
              content: chapter.description,
              order_index: index,
            }),
          ),
        )
      }

      toast({
        title: "Project created",
        description: "Your new ebook project has been created successfully.",
      })

      // Redirect to the new project page
      router.push(`/projects/${newProject.id}`)
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

  const handleGenerate = async () => {
    if (!prompt || !user) return

    setLoading(true)
    try {
      // Generate title and description
      const chapterIdeas = await generateChapterIdeas(
        "Untitled Book", // We don't have a title yet
        prompt,
        user.id,
        "openai",
        chapterCount,
      )

      // Set the first chapter title as the book title
      setTitle(chapterIdeas[0].title)
      setDescription(prompt)
      setGeneratedChapters(chapterIdeas)

      toast({
        title: "Content generated",
        description: "AI has created a book outline based on your prompt.",
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCoverUpload = (file: File) => {
    setCoverFile(file)
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-8 min-h-[calc(100vh-3.5rem)] flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Create New Ebook Project</h1>

      <Tabs defaultValue="manual" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          <TabsTrigger value="ai">AI-Assisted</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="flex-1 flex items-start justify-center">
          <Card className="w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Enter the basic information for your new ebook project</CardDescription>
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

                <div className="space-y-2">
                  <Label htmlFor="chapters">Number of Chapters</Label>
                  <Input
                    id="chapters"
                    type="number"
                    min={1}
                    max={50}
                    value={chapterCount}
                    onChange={(e) => setChapterCount(Number.parseInt(e.target.value))}
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
                <Button variant="outline" type="button" onClick={() => router.push("/projects")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !title}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 flex items-start justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>AI-Assisted Creation</CardTitle>
              <CardDescription>Let AI help you generate your ebook structure and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe your ebook</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the topic, style, and content of the ebook you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-chapters">Number of Chapters</Label>
                <Input
                  id="ai-chapters"
                  type="number"
                  min={1}
                  max={50}
                  value={chapterCount}
                  onChange={(e) => setChapterCount(Number.parseInt(e.target.value))}
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full" variant="secondary">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>

              {generatedChapters.length > 0 && (
                <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label>Generated Title</Label>
                    <p className="font-medium">{title}</p>
                  </div>

                  <div>
                    <Label>Generated Description</Label>
                    <p>{description}</p>
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
                    <Switch id="visibility-ai" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="visibility-ai" className="flex items-center gap-2">
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

                  <div className="space-y-2">
                    <Label>Chapter Outline</Label>
                    <div className="space-y-2">
                      {generatedChapters.map((chapter, index) => (
                        <div key={index} className="p-2 border rounded">
                          <p className="font-medium">
                            Chapter {index + 1}: {chapter.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/projects")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !title}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
