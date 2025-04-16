"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Edit,
  PlusCircle,
  Loader2,
  Lock,
  Globe,
  FileImage,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChapterList } from "@/components/chapter-list"
import { downloadEbookAsPDF } from "@/lib/pdf-service"
import { useToast } from "@/hooks/use-toast"
import { getProject } from "@/lib/project-service"
import { getChapters } from "@/lib/chapter-service"
import { supabase } from "@/lib/supabase-client"
import { getBasicUserInfo } from "@/lib/user-service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const projectId = params.id
  const { toast } = useToast()
  const router = useRouter()

  // State variables
  const [authChecked, setAuthChecked] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [author, setAuthor] = useState<any>(null)

  // Check authentication status directly with Supabase
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth check error:", error)
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(!!data.session)
          setCurrentUser(data.session?.user || null)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect if the ID is "new" - this should be handled by the /projects/new route
  useEffect(() => {
    if (projectId === "new") {
      router.push("/projects/new")
    }
  }, [projectId, router])

  // Fetch project and chapters
  useEffect(() => {
    async function loadProjectData() {
      if (projectId === "new" || !authChecked) return

      try {
        setLoading(true)
        const projectData = await getProject(projectId)
        const chaptersData = await getChapters(projectId)

        setProject(projectData)
        setChapters(chaptersData)

        // Fetch author information
        if (projectData.user_id) {
          try {
            const authorData = await getBasicUserInfo(projectData.user_id)
            setAuthor(authorData)
          } catch (authorError) {
            console.error("Error fetching author:", authorError)
          }
        }

        // Check if the current user is the owner of the project
        setIsOwner(currentUser?.id === projectData.user_id)
      } catch (err) {
        console.error(`Error loading project ${projectId}:`, err)
        setError("Failed to load project. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (authChecked) {
      loadProjectData()
    }
  }, [projectId, authChecked, currentUser])

  // If the ID is "new", we should never render this component
  if (projectId === "new") {
    return null
  }

  const handleExportPDF = async () => {
    if (!project || !chapters || chapters.length === 0) {
      toast({
        title: "Export failed",
        description: "Cannot export an empty project. Please add at least one chapter.",
        variant: "destructive",
      })
      return
    }

    setExporting(true)
    try {
      // Create a combined object with project and chapters
      const projectWithChapters = {
        ...project,
        chapters: chapters,
      }

      // Call the PDF export function
      await downloadEbookAsPDF(projectWithChapters)

      toast({
        title: "Export successful",
        description: `${project.title} has been exported as PDF.`,
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your ebook. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  // Social media sharing functions
  const shareToSocialMedia = (platform: string) => {
    if (!project) return

    const projectTitle = encodeURIComponent(project.title)
    const projectUrl = encodeURIComponent(`${window.location.origin}/projects/${projectId}`)
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

  // Show loading state while checking authentication or loading data
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, this will redirect, but we'll show a message just in case
  if (authChecked && !isAuthenticated) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center p-6 shadow-lg">
          <CardHeader>
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view this project</CardDescription>
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

  // Show error message if project failed to load
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-6 shadow-lg">
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

  // Show message if project not found
  if (!project) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-6 shadow-lg">
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
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
      <div className="flex items-center mb-4 md:mb-6 bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-sm">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 mb-6 md:mb-8 bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex gap-6">
          {project.cover_image && (
            <div className="hidden md:block">
              <img
                src={project.cover_image || "/placeholder.svg"}
                alt={`Cover for ${project.title}`}
                className="w-32 h-auto object-cover rounded-md shadow-md"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <Badge variant={project.visibility === "public" ? "default" : "secondary"} className="ml-2">
                {project.visibility === "public" ? (
                  <div className="flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </div>
                )}
              </Badge>
            </div>
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
                    <Link href={`/users/${author.id}`} className="font-medium hover:underline text-primary">
                      {author.full_name}
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Share Button */}
          {project.visibility === "public" && (
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
          )}

          {isOwner && (
            <>
              <Link href={`/projects/${projectId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/assets`}>
                <Button variant="outline">
                  <FileImage className="mr-2 h-4 w-4" />
                  Manage Assets
                </Button>
              </Link>
              <Button
                onClick={handleExportPDF}
                disabled={exporting || !chapters || chapters.length === 0}
                title={!chapters || chapters.length === 0 ? "Add at least one chapter to export" : "Export as PDF"}
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </>
                )}
              </Button>
              <DeleteProjectDialog projectId={projectId} projectTitle={project.title} />
            </>
          )}
        </div>
      </div>

      <Card className="mb-8 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chapters</CardTitle>
            <CardDescription>Manage and edit individual chapters of your ebook</CardDescription>
          </div>
          {isOwner && (
            <Link href={`/projects/${projectId}/chapters/new`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </Link>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <ChapterList projectId={projectId} chapters={chapters} isOwner={isOwner} />
        </CardContent>
      </Card>
    </div>
  )
}
