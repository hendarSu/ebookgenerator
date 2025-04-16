"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ChevronRight, Loader2, User, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getBasicUserInfo, getUserProjects, type UserProfile } from "@/lib/user-service"

interface UserProfilePageProps {
  params: {
    id: string
  }
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const userId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true)

        // Fetch user profile
        const userProfile = await getBasicUserInfo(userId)

        if (!userProfile) {
          setError("User not found or has no public content")
          return
        }

        setUser(userProfile)

        // Fetch user's public projects
        const { data: projectsData } = await getUserProjects(userId)
        setProjects(projectsData || [])
      } catch (err) {
        console.error("Error loading user data:", err)
        setError("Failed to load user profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userId, toast])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>{error || "This user profile doesn't exist or is not available."}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/explore">
              <Button>Explore Public Projects</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-10">
      {/* Profile Header */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-20 h-20 text-4xl">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback className="bg-gray-100 text-gray-800">{user.full_name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold">{user.full_name}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <FileText className="h-4 w-4" />
                <span>Member since {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Public Projects Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Public Projects</h2>
          </div>
          <p className="text-muted-foreground mt-1">Explore {user.full_name}'s public ebooks</p>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center p-10">
            <div className="flex flex-col items-center gap-2 mb-6">
              <User className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No public projects</h3>
              <p className="text-muted-foreground">This user hasn't published any public ebooks yet.</p>
            </div>
            <Link href="/explore">
              <Button>Explore Other Projects</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{project.description}</p>

                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline">Public</Badge>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="border-t p-4 bg-muted/30 flex justify-end">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
