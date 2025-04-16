"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Import the VideoEmbed component
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
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [chapter, setChapter] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single()

        if (projectError) {
          console.error(`Error fetching project ${projectId}:`, projectError)
          return
        }

        // Fetch chapter details
        const { data: chapterData, error: chapterError } = await supabase
          .from("chapters")
          .select("*")
          .eq("id", chapterId)
          .single()

        if (chapterError) {
          console.error(`Error fetching chapter ${chapterId}:`, chapterError)
          return
        }

        // Fetch all chapters for the project
        const { data: chaptersData, error: chaptersError } = await supabase
          .from("chapters")
          .select("*")
          .eq("project_id", projectId)
          .order("order_index", { ascending: true })

        if (chaptersError) {
          console.error(`Error fetching chapters for project ${projectId}:`, chaptersError)
          return
        }

        setProject(projectData)
        setChapter(chapterData)
        setChapters(chaptersData || [])

        // Check if the current user is the owner of the project
        const { data } = await supabase.auth.getUser()
        setIsOwner(data?.user?.id === projectData.user_id)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load chapter data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId, chapterId, toast])

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
    html = html.replace(/!\[(.*?)\]\$\$([^$]*)\$\$/g, (match, alt, src) => {
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

  // Find current chapter index
  const currentChapterIndex = chapters.findIndex((ch) => ch.id === chapterId)
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null

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
              <Link href="/demo">
                <Button>Go to Projects</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/demo/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/demo/projects/${projectId}/chapters/${chapterId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Chapter
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-auto mt-2.5">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border mb-6">
              {/* Mobile view - collapsible */}
              <div className="md:hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer">
                    <div className="flex items-center">
                      <span className="font-medium">Table of Contents</span>
                    </div>
                  </summary>

                  <div className="p-4 pt-0 space-y-2">
                    {chapters.map((ch, index) => (
                      <Link
                        key={ch.id}
                        href={`/demo/projects/${projectId}/chapters/${ch.id}`}
                        className={cn(
                          "block py-2 px-3 rounded-md text-sm",
                          ch.id === chapterId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                        )}
                      >
                        <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                        {ch.title}
                      </Link>
                    ))}
                  </div>
                </details>
              </div>

              {/* Desktop view - always visible */}
              <div className="hidden md:block p-4">
                <div className="flex items-center mb-3">
                  <h3 className="font-medium">Table of Contents</h3>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                  {chapters.map((ch, index) => (
                    <Link
                      key={ch.id}
                      href={`/demo/projects/${projectId}/chapters/${ch.id}`}
                      className={cn(
                        "block py-2 px-3 rounded-md text-sm",
                        ch.id === chapterId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                      )}
                    >
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {ch.title}
                    </Link>
                  ))}
                </div>

                {/* Previous/Next navigation */}
                <div className="flex justify-between mt-4 pt-3 border-t">
                  {prevChapter ? (
                    <Link
                      href={`/demo/projects/${projectId}/chapters/${prevChapter.id}`}
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">Previous</span>
                  )}

                  {nextChapter ? (
                    <Link
                      href={`/demo/projects/${projectId}/chapters/${nextChapter.id}`}
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      Next
                      <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">Next</span>
                  )}
                </div>
              </div>
            </div>
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
                "prose prose-sm md:prose-base lg:prose-lg max-w-none p-4 md:p-6",
                "prose-headings:mb-3 prose-headings:mt-4",
                "prose-p:my-2 prose-li:my-0",
                "prose-pre:my-4 prose-pre:p-3 prose-pre:rounded-md",
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

