import { supabase } from "./supabase"
import type { Database } from "@/types/supabase"

export type Chapter = Database["public"]["Tables"]["chapters"]["Row"]
export type NewChapter = Database["public"]["Tables"]["chapters"]["Insert"]
export type UpdateChapter = Database["public"]["Tables"]["chapters"]["Update"]

export async function getChapters(projectId: string) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error(`Error fetching chapters for project ${projectId}:`, error)
    throw error
  }

  return data
}

// Modify the getChapter function to check for the "new" ID
export async function getChapter(id: string) {
  // If the ID is "new", return null or throw a specific error
  if (id === "new") {
    throw new Error("Cannot fetch chapter with ID 'new'")
  }

  const { data, error } = await supabase.from("chapters").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching chapter ${id}:`, error)
    throw error
  }

  return data
}

export async function createChapter(chapter: NewChapter) {
  const { data, error } = await supabase.from("chapters").insert(chapter).select().single()

  if (error) {
    console.error("Error creating chapter:", error)
    throw error
  }

  return data
}

export async function updateChapter(id: string, updates: UpdateChapter) {
  const { data, error } = await supabase.from("chapters").update(updates).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating chapter ${id}:`, error)
    throw error
  }

  return data
}

export async function deleteChapter(id: string) {
  const { error } = await supabase.from("chapters").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting chapter ${id}:`, error)
    throw error
  }

  return true
}

export async function reorderChapters(projectId: string, orderedIds: string[]) {
  // Create a batch of updates
  const updates = orderedIds.map((id, index) => ({
    id,
    order_index: index,
  }))

  const { error } = await supabase.from("chapters").upsert(updates)

  if (error) {
    console.error(`Error reordering chapters for project ${projectId}:`, error)
    throw error
  }

  return true
}
