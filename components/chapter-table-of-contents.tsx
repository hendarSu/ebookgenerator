"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChapterTableOfContentsProps {
  projectId: string
  currentChapterId: string
  chapters: Array<{
    id: string
    title: string
    order_index: number
  }>
}

export function ChapterTableOfContents({ projectId, currentChapterId, chapters }: ChapterTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Sort chapters by order_index
  const sortedChapters = [...chapters].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  // Find current chapter index
  const currentChapterIndex = sortedChapters.findIndex((chapter) => chapter.id === currentChapterId)
  const currentChapter = sortedChapters[currentChapterIndex]

  // Get previous and next chapters if they exist
  const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null
  const nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null

  return (
    <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border">
      {/* Mobile view - collapsible */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center p-4 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            <span>Table of Contents</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isOpen && (
          <div className="p-4 pt-0 space-y-2">
            {sortedChapters.map((chapter, index) => (
              <Link
                key={chapter.id}
                href={`/projects/${projectId}/chapters/${chapter.id}`}
                className={cn(
                  "block py-2 px-3 rounded-md text-sm",
                  chapter.id === currentChapterId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                )}
              >
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {chapter.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop view - always visible */}
      <div className="hidden md:block p-4">
        <div className="flex items-center mb-3">
          <List className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Table of Contents</h3>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {sortedChapters.map((chapter, index) => (
            <Link
              key={chapter.id}
              href={`/projects/${projectId}/chapters/${chapter.id}`}
              className={cn(
                "block py-2 px-3 rounded-md text-sm",
                chapter.id === currentChapterId ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
              )}
            >
              <span className="mr-2 text-muted-foreground">{index + 1}.</span>
              {chapter.title}
            </Link>
          ))}
        </div>

        {/* Previous/Next navigation */}
        <div className="flex justify-between mt-4 pt-3 border-t">
          {prevChapter ? (
            <Link
              href={`/projects/${projectId}/chapters/${prevChapter.id}`}
              className="text-sm text-primary hover:underline flex items-center"
            >
              <ChevronUp className="h-4 w-4 rotate-90 mr-1" />
              Previous
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Previous</span>
          )}

          {nextChapter ? (
            <Link
              href={`/projects/${projectId}/chapters/${nextChapter.id}`}
              className="text-sm text-primary hover:underline flex items-center"
            >
              Next
              <ChevronDown className="h-4 w-4 rotate-90 ml-1" />
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Next</span>
          )}
        </div>
      </div>
    </div>
  )
}
