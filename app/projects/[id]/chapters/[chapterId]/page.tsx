"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Loader2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { getProject } from "@/lib/project-service"
import { getChapter, getChapters } from "@/lib/chapter-service"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
import { ChapterTableOfContents } from "@/components/chapter-table-of-contents"
import { VideoEmbed } from "@/components/video-embed"

interface ChapterPageProps {
  params: {
    id: string
    chapterId: string
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const { id: projectId, chapterId } = params
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch project and chapter data
  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return

      // Redirect to edit page if chapterId is "new"
      if (chapterId === "new") {
        router.push(`/projects/${projectId}/chapters/new`)
        return
      }

      try {
        setLoading(true)
        const [projectData, chapterData, chaptersData] = await Promise.all([
          getProject(projectId),
          getChapter(chapterId),
          getChapters(projectId),
        ])

        setProject(projectData)
        setChapter(chapterData)
        setChapters(chaptersData)

        // Check if the current user is the owner of the project
        const { data } = await supabase.auth.getUser()
        setIsOwner(data?.user?.id === projectData.user_id)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load chapter. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId, chapterId, isAuthenticated, router])

  // Function to render Markdown content
  const renderMarkdown = (content: string) => {
    if (!content) return { __html: "" }

    let html = content

    // Process code blocks first
    html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, language, code) => {
      const lang = language || "plaintext"
      return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="language-${lang}">${escapeHtml(code)}</code></pre>`
    })

    // Process inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')

    // Process images with standard markdown syntax
    html = html.replace(/!\[(.*?)\]\$\$([^$]*?)\$\$/g, (match, alt, src) => {
      // Ensure the src is properly used as-is, whether it's a URL or data URL
      return `<img src="${src}" alt="${alt || ""}" class="max-w-full h-auto rounded-md my-4" />`
    })

    // Process other markdown elements
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.*$)/gm, "<li>$2</li>")
      .replace(/\n\n/g, "<br/><br/>")

    return { __html: html }
  }

  // Helper function to escape HTML
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, this will redirect, but we'll show a message just in case
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view this chapter</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Show error message if data failed to load
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-6">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Show message if chapter not found
  if (!chapter || !project) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-6">
            <CardHeader>
              <CardTitle>Chapter Not Found</CardTitle>
              <CardDescription>
                The chapter you're looking for doesn't exist or you don't have access to it.
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
      <div className="flex items-center justify-between mb-6">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
        {isOwner && (
          <Link href={`/projects/${projectId}/chapters/${chapterId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Chapter
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Table of Contents - Sidebar */}
        <div className="md:col-span-1">
          <div className="md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-auto mt-2.5">
            {chapters.length > 0 && (
              <ChapterTableOfContents projectId={projectId} currentChapterId={chapterId} chapters={chapters} />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">{chapter.title}</h1>
            <p className="text-muted-foreground mt-2">
              Chapter from <span className="font-medium">{project.title}</span>
            </p>
          </div>

          {chapter.video_url && (
            <div className="mb-6">
              <VideoEmbed url={chapter.video_url} title={chapter.title} className="shadow-sm" />
            </div>
          )}

          <Card className="shadow-sm">
            <CardContent
              className={cn(
                "prose prose-sm md:prose-base lg:prose-lg max-w-none p-3 md:p-4 lg:p-6",
                "prose-headings:mb-2 prose-headings:mt-3 md:prose-headings:mb-3 md:prose-headings:mt-4",
                "prose-p:my-1.5 md:prose-p:my-2 prose-li:my-0",
                "prose-pre:my-3 md:prose-pre:my-4 prose-pre:p-2 md:prose-pre:p-3 prose-pre:rounded-md",
                "prose-img:mx-auto prose-img:rounded-md",
              )}
            >
              {chapter.content ? (
                <div dangerouslySetInnerHTML={renderMarkdown(chapter.content)} />
              ) : (
                <p className="text-muted-foreground italic">
                  {isOwner
                    ? "No content yet. Click the Edit button to add content to this chapter."
                    : "This chapter has no content yet."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

