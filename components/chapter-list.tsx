"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Edit, GripVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getChapters } from "@/lib/chapter-service"
import type { Chapter } from "@/lib/chapter-service"

interface ChapterListProps {
  projectId: string
  chapters?: Chapter[]
  isOwner?: boolean
}

export function ChapterList({ projectId, chapters: initialChapters, isOwner = true }: ChapterListProps) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters || [])
  const [loading, setLoading] = useState(!initialChapters)

  useEffect(() => {
    if (initialChapters) {
      setChapters(initialChapters)
      return
    }

    async function loadChapters() {
      try {
        setLoading(true)
        const data = await getChapters(projectId)
        setChapters(data)
      } catch (error) {
        console.error("Error loading chapters:", error)
      } finally {
        setLoading(false)
      }
    }

    loadChapters()
  }, [projectId, initialChapters])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-4 border rounded-lg">
            <Skeleton className="h-6 w-6 mr-4" />
            <div className="flex-1">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg">
        <p className="text-muted-foreground mb-4">
          No chapters yet.{" "}
          {isOwner ? "Add your first chapter to get started." : "The author hasn't added any chapters yet."}
        </p>
        {isOwner && (
          <Link href={`/projects/${projectId}/chapters/new`}>
            <Button>Add First Chapter</Button>
          </Link>
        )}
      </div>
    )
  }

  // Sort chapters by order_index
  const sortedChapters = [...chapters].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  return (
    <div className="space-y-3">
      {sortedChapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className="flex items-center p-3 md:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-center mr-3 text-muted-foreground">
            {isOwner && <GripVertical className="h-5 w-5" />}
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
              <span className="mx-2">•</span>
              <span>Updated {formatDistanceToNow(new Date(chapter.updated_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <Link href={`/projects/${projectId}/chapters/${chapter.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            <Link href={`/projects/${projectId}/chapters/${chapter.id}`}>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
