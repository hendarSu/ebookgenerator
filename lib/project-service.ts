import { supabase } from "./supabase"
import type { Database } from "@/types/supabase"
// Import the storage service at the top of the file
import { uploadFile, deleteFile, STORAGE_BUCKETS } from "./storage-service"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type NewProject = Database["public"]["Tables"]["projects"]["Insert"]
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"]
export type ProjectVisibility = "public" | "private"

export async function getProjects() {
  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    throw error
  }

  return data
}

export async function getProject(id: string) {
  // Validate UUID format to prevent invalid requests
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new Error(`Invalid project ID format: ${id}`)
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // First try to get the project without user check (for public projects)
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    throw error
  }

  // If the project is private and doesn't belong to the current user, deny access
  if (data.visibility === "private" && (!user || data.user_id !== user.id)) {
    throw new Error("Access denied: This project is private")
  }

  return data
}

export async function getPublicProjects(search?: string, limit = 12, page = 1) {
  let query = supabase
    .from("projects")
    .select("*", { count: "exact" }) // Remove the join with user_settings
    .eq("visibility", "public")
    .order("updated_at", { ascending: false })

  // Add search functionality if a search term is provided
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Add pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error("Error fetching public projects:", error)
    throw error
  }

  return { data, count }
}

export async function createProject(project: NewProject) {
  // Set default visibility to private if not specified
  const projectWithVisibility = {
    ...project,
    visibility: project.visibility || "private",
  }

  const { data, error } = await supabase.from("projects").insert(projectWithVisibility).select().single()

  if (error) {
    console.error("Error creating project:", error)
    throw error
  }

  return data
}

export async function updateProject(id: string, updates: UpdateProject) {
  const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating project ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting project ${id}:`, error)
    throw error
  }

  return true
}

// Replace the uploadCoverImage function with this:
export async function uploadCoverImage(file: File, userId: string): Promise<string> {
  return uploadFile(file, STORAGE_BUCKETS.COVERS, userId, "covers")
}

// Replace the deleteCoverImage function with this:
export async function deleteCoverImage(url: string) {
  return deleteFile(url, STORAGE_BUCKETS.COVERS)
}

