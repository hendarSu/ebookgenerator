"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface VideoEmbedProps {
  url: string
  title?: string
  className?: string
}

export function VideoEmbed({ url, title, className = "" }: VideoEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    try {
      // YouTube URL patterns
      const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
      const youtubeMatch = url.match(youtubeRegex)

      // Vimeo URL patterns
      const vimeoRegex =
        /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|)(\d+)(?:$|\/|\?))/i
      const vimeoMatch = url.match(vimeoRegex)

      if (youtubeMatch && youtubeMatch[1]) {
        // YouTube embed URL
        setEmbedUrl(`https://www.youtube.com/embed/${youtubeMatch[1]}`)
        setError(null)
      } else if (vimeoMatch && vimeoMatch[1]) {
        // Vimeo embed URL
        setEmbedUrl(`https://player.vimeo.com/video/${vimeoMatch[1]}`)
        setError(null)
      } else {
        setError("Unsupported video URL. Please use YouTube or Vimeo links.")
      }
    } catch (err) {
      setError("Failed to process video URL")
      console.error("Error processing video URL:", err)
    } finally {
      setLoading(false)
    }
  }, [url])

  if (!url) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-muted/30 rounded-md ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 bg-muted/30 rounded-md text-center ${className}`}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!embedUrl) {
    return null
  }

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`} style={{ paddingTop: "56.25%" }}>
      <iframe
        src={embedUrl}
        title={title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
      />
    </div>
  )
}

