"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetManager } from "@/components/asset-manager"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getProject } from "@/lib/project-service"

interface ProjectAssetsPageProps {
  params: {
    id: string
  }
}

export default function ProjectAssetsPage({ params }: ProjectAssetsPageProps) {
  const projectId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)

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

    loadProject()
  }, [projectId, isAuthenticated, toast])

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
            <CardContent>
              <Link href="/projects">
                <Button>Go to Projects</Button>
              </Link>
            </CardContent>
          </Card>
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
        <h1 className="text-3xl font-bold">Project Assets</h1>
        <p className="text-muted-foreground mt-2">
          Manage files and images for <span className="font-medium">{project.title}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <AssetManager projectId={projectId} />
      </div>
    </div>
  )
}

