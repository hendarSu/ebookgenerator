"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  onFile?: (file: File) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({
  value,
  onChange,
  onFile,
  accept = "image/*",
  maxSize = 5, // Default 5MB
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (accept !== "*" && !file.type.match(accept.replace("*", ""))) {
      setError(`Invalid file type. Please upload ${accept.replace("*", "")} files.`)
      return false
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`)
      return false
    }

    setError(null)
    return true
  }

  const processFile = (file: File) => {
    if (!validateFile(file)) return

    // If onFile callback is provided, call it with the file
    if (onFile) {
      onFile(file)
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          value ? "bg-muted/50" : "bg-background",
          "cursor-pointer hover:bg-muted/50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

        {value ? (
          <div className="relative w-full max-w-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 rounded-full bg-foreground/10 hover:bg-foreground/20 z-10"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
            <img
              src={value || "/placeholder.svg"}
              alt="Preview"
              className="mx-auto max-h-48 rounded-md object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="rounded-full bg-muted p-2">
              {accept.includes("image") ? (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">
                {accept === "image/*" ? "PNG, JPG or GIF" : accept.replace("*", "")} up to {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

