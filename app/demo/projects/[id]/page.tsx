"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, PlusCircle, Edit, Download, Share2, Twitter, Facebook, Linkedin, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const projectId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [author, setAuthor] = useState<any>(null)

  useEffect(() => {
    async function loadProjectData() {
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

        // Fetch chapters for this project
        const { data: chaptersData, error: chaptersError } = await supabase
          .from("chapters")
          .select("*")
          .eq("project_id", projectId)
          .order("order_index", { ascending: true })

        if (chaptersError) {
          console.error(`Error fetching chapters for project ${projectId}:`, chaptersError)
          return
        }

        // Fetch author information - first try users table
        if (projectData.user_id) {
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", projectData.user_id)
              .single()

            if (!userError && userData) {
              setAuthor({
                id: projectData.user_id,
                full_name: userData.full_name || userData.full_name || "Project Author",
                avatar_url: userData.avatar_url,
                created_at: userData.created_at || new Date().toISOString(),
              })
            }
          } catch (authorError) {
            console.error("Error fetching author:", authorError)
            // Provide a fallback author
            setAuthor({
              id: projectData.user_id,
              full_name: "Project Author",
              created_at: new Date().toISOString(),
            })
          }
        }

        setProject(projectData)
        setChapters(chaptersData || [])
      } catch (error) {
        console.error("Error loading data:", error)
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
  }, [projectId, toast])

  const handleAddChapter = async () => {
    try {
      // Get the count of existing chapters to determine the order_index
      const orderIndex = chapters.length

      // Create a new chapter
      const { data, error } = await supabase
        .from("chapters")
        .insert({
          project_id: projectId,
          title: `Chapter ${orderIndex + 1}`,
          content: "",
          order_index: orderIndex,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Add the new chapter to the list
      setChapters([...chapters, data])

      toast({
        title: "Chapter added",
        description: "New chapter has been added to your project.",
      })
    } catch (error) {
      console.error("Error adding chapter:", error)
      toast({
        title: "Error",
        description: "Failed to add chapter. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Social media sharing functions
  const shareToSocialMedia = (platform: string) => {
    if (!project) return

    const projectTitle = encodeURIComponent(project.title)
    const projectUrl = encodeURIComponent(`${window.location.origin}/demo/projects/${projectId}`)
    const projectDescription = encodeURIComponent(project.description || "Check out this ebook project!")

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${projectTitle}&url=${projectUrl}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${projectUrl}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${projectUrl}&title=${projectTitle}&summary=${projectDescription}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${projectTitle}%20${projectUrl}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${projectUrl}&text=${projectTitle}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "width=600,height=400")

    toast({
      title: "Shared!",
      description: `Project shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

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
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/demo">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="flex gap-6">
          {project.cover_image && (
            <div className="hidden md:block">
              <img
                src={project.cover_image || "/placeholder.svg?height=128&width=96"}
                alt={`Cover for ${project.title}`}
                className="w-32 h-auto object-cover rounded-md shadow-md"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>

            {/* Author information */}
            {author && (
              <div className="mt-4 flex items-center gap-2">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url || "/placeholder.svg"}
                      alt={author.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-medium">{author.full_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm">
                    By{" "}
                    <Link href={`/demo/users/${author.id}`} className="font-medium hover:underline text-primary">
                      {author.full_name}
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Share Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => shareToSocialMedia("twitter")} className="cursor-pointer">
                <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
                <span>Twitter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocialMedia("facebook")} className="cursor-pointer">
                <Facebook className="mr-2 h-4 w-4 text-[#4267B2]" />
                <span>Facebook</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocialMedia("linkedin")} className="cursor-pointer">
                <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
                <span>LinkedIn</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocialMedia("whatsapp")} className="cursor-pointer">
                <Send className="mr-2 h-4 w-4 text-[#25D366]" />
                <span>WhatsApp</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => shareToSocialMedia("telegram")} className="cursor-pointer">
                <Send className="mr-2 h-4 w-4 text-[#0088cc]" />
                <span>Telegram</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/demo/projects/${projectId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </Link>
          <Button
            variant="outline"
            disabled={!chapters || chapters.length === 0}
            title={!chapters || chapters.length === 0 ? "Add at least one chapter to export" : "Export as PDF"}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chapters</CardTitle>
            <CardDescription>Manage and edit individual chapters of your ebook</CardDescription>
          </div>
          <Button onClick={handleAddChapter}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {chapters.length === 0 ? (
            <div className="text-center p-10 border rounded-lg">
              <p className="text-muted-foreground mb-4">No chapters yet. Add your first chapter to get started.</p>
              <Button onClick={handleAddChapter}>Add First Chapter</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="flex items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center mr-3 text-muted-foreground">
                    <span className="w-6 text-center font-medium">{index + 1}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        {chapter.content
                          ? chapter.content.length > 0
                            ? `${chapter.content.length} characters`
                            : "Empty"
                          : "No content"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/demo/projects/${projectId}/chapters/${chapter.id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
