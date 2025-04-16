"use client"

import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { streamAssistantResponse, type AssistantMode } from "@/lib/ai-assistant-service"
import { Loader2 } from "lucide-react"

interface AIAssistantProps {
  context: string
  onInsertText: (text: string) => void
  className?: string
}

export function AIAssistant({ context, onInsertText, className }: AIAssistantProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [mode, setMode] = useState<AssistantMode>("writer")
  const [loading, setLoading] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt || !user) return

    setLoading(true)
    setResponse("")

    try {
      await streamAssistantResponse(
        prompt,
        mode,
        context,
        (chunk) => {
          setResponse((prev) => prev + chunk)
        },
        user.id,
      )
    } catch (error: any) {
      console.error("Error generating content:", error)
      toast({
        title: "Generation failed",
        description: error.message || "There was an error generating content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [prompt, mode, context, user, toast])

  const handleInsert = () => {
    onInsertText(response)
    toast({
      title: "Content inserted",
      description: "The generated content has been inserted into the editor.",
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>Let AI help you with your writing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger id="mode">
              <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="writer">Writer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="researcher">Researcher</SelectItem>
              <SelectItem value="summarizer">Summarizer</SelectItem>
              <SelectItem value="translator">Translator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {response && (
          <div className="space-y-2">
            <Label>Response</Label>
            <Textarea value={response} readOnly className="min-h-[100px] resize-none" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setPrompt("")}>
          Clear
        </Button>
        <div className="flex space-x-2">
          {response && (
            <Button type="button" onClick={handleInsert}>
              Insert
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
