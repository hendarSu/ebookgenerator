"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteProject } from "@/lib/project-service"
import { useToast } from "@/hooks/use-toast"

interface DeleteProjectDialogProps {
  projectId: string
  projectTitle: string
}

export function DeleteProjectDialog({ projectId, projectTitle }: DeleteProjectDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  const isConfirmValid = confirmText === projectTitle

  const handleDelete = async () => {
    setDeleting(true)

    try {
      await deleteProject(projectId)

      toast({
        title: "Project deleted",
        description: `"${projectTitle}" has been permanently deleted.`,
      })

      // Close the dialog and redirect to the projects list
      setOpen(false)
      router.push("/projects")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your ebook project
            <strong> "{projectTitle}" </strong>
            and all of its chapters.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="confirm" className="text-sm font-medium">
            Type <span className="font-semibold">{projectTitle}</span> to confirm
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={projectTitle}
            className={!isConfirmValid && confirmText ? "border-destructive" : ""}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmValid || deleting} className="gap-2">
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {deleting ? "Deleting..." : "Delete Project"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

