import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

// Define storage buckets
export const STORAGE_BUCKETS = {
  COVERS: "project-covers",
  ASSETS: "ebook-assets",
  EXPORTS: "ebook-exports",
}

// Upload a file to a specific bucket
export async function uploadFile(file: File, bucket: string, userId: string, folder = ""): Promise<string> {
  // Create a unique file path
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${uuidv4()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (uploadError) {
    console.error(`Error uploading file to ${bucket}:`, uploadError)
    throw uploadError
  }

  // Get the public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return data.publicUrl
}

// Delete a file from storage
export async function deleteFile(url: string, bucket: string): Promise<boolean> {
  try {
    // Extract the file path from the URL
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const bucketIndex = pathParts.indexOf(bucket)

    if (bucketIndex === -1) {
      throw new Error(`Invalid URL: ${bucket} not found in path`)
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/")

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error(`Error deleting file from ${bucket}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    throw error
  }
}

// List files in a folder
export async function listFiles(
  bucket: string,
  folder = "",
  limit = 100,
): Promise<{ name: string; url: string; size: number; created_at: string }[]> {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  })

  if (error) {
    console.error(`Error listing files in ${bucket}/${folder}:`, error)
    throw error
  }

  // Convert to a more usable format with URLs
  return data.map((item) => {
    const path = folder ? `${folder}/${item.name}` : item.name
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return {
      name: item.name,
      url: urlData.publicUrl,
      size: item.metadata?.size || 0,
      created_at: item.created_at || new Date().toISOString(),
    }
  })
}

// Create a signed URL for temporary access
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60, // seconds
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    console.error(`Error creating signed URL for ${bucket}/${path}:`, error)
    throw error
  }

  return data.signedUrl
}

// Get file metadata
export async function getFileMetadata(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).getPublicUrl(path)

  if (error) {
    console.error(`Error getting metadata for ${bucket}/${path}:`, error)
    throw error
  }

  return data
}

