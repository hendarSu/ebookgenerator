"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Upload, Trash2, FileIcon, ImageIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { uploadFile, listFiles, deleteFile, STORAGE_BUCKETS } from "@/lib/storage-service"
import { useAuth } from "@/context/auth-context"
import { formatBytes } from "@/lib/utils"

interface AssetManagerProps {
  projectId: string
  onSelectAsset?: (url: string) => void
}

export function AssetManager({ projectId, onSelectAsset }: AssetManagerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    loadAssets()
  }, [projectId])

  const loadAssets = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const assetList = await listFiles(STORAGE_BUCKETS.ASSETS, projectId)
      setAssets(assetList)
    } catch (error) {
      console.error("Error loading assets:", error)
      toast({
        title: "Error",
        description: "Failed to load assets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user || !projectId) return

    try {
      setUploading(true)
      await uploadFile(selectedFile, STORAGE_BUCKETS.ASSETS, user.id, projectId)

      toast({
        title: "Asset uploaded",
        description: "Your file has been uploaded successfully.",
      })

      // Reset and reload
      setSelectedFile(null)
      await loadAssets()
    } catch (error) {
      console.error("Error uploading asset:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (url: string) => {
    try {
      await deleteFile(url, STORAGE_BUCKETS.ASSETS)

      toast({
        title: "Asset deleted",
        description: "The file has been deleted successfully.",
      })

      // Reload assets
      await loadAssets()
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast({
        title: "Deletion failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5" />
    } else if (["pdf", "doc", "docx", "txt", "md"].includes(ext || "")) {
      return <FileText className="h-5 w-5" />
    } else {
      return <FileIcon className="h-5 w-5" />
    }
  }

  const isImage = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Assets</CardTitle>
        <CardDescription>Manage files and images for your ebook</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload New Asset</Label>
          <div className="flex gap-2">
            <Input id="file-upload" type="file" onChange={handleFileChange} disabled={uploading} />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="whitespace-nowrap">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Assets</Label>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No assets uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assets.map((asset) => (
                <div
                  key={asset.url}
                  className="border rounded-md p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {isImage(asset.name) ? (
                      <div className="h-12 w-12 rounded-md overflow-hidden">
                        <img
                          src={asset.url || "/placeholder.svg"}
                          alt={asset.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                        {getFileIcon(asset.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(asset.size)}</p>
                  </div>

                  <div className="flex gap-1">
                    {onSelectAsset && (
                      <Button variant="ghost" size="sm" onClick={() => onSelectAsset(asset.url)}>
                        Use
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.url)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
