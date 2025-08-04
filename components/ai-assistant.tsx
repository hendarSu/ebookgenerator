"use client"

import { useState, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { streamAssistantResponse, type AssistantMode } from "@/lib/ai-assistant-service"
import { Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

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
  const [error, setError] = useState<string | null>(null)
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      setError("Please log in to use the AI assistant.")
    } else {
      setError(null)
    }
  }, [user])

  const handleGenerate = useCallback(async () => {
    if (!prompt || !user) {
      toast({
        title: "Error",
        description: "Please enter a prompt and ensure you're logged in.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResponse("")
    setError(null)

    try {
      console.log("Generating content with user ID:", user.id)

      await streamAssistantResponse(
        prompt,
        mode,
        context,
        (chunk) => {
          setResponse((prev) => prev + chunk)
        },
        user.id,
        "openai",
      )
    } catch (error: any) {
      console.error("Error generating content:", error)
      setError(
        error.message || "Failed to generate content. Please ensure you've configured your API key in AI Settings.",
      )
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
    if (!response) return

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
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && !user?.id && (
          <Alert>
            <AlertDescription>Please log in to use the AI assistant.</AlertDescription>
          </Alert>
        )}

        {user?.id && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              To use the AI assistant, you need to configure your OpenAI API key in{" "}
              <Link href="/ai-settings" className="font-medium underline">
                AI Settings
              </Link>
              .
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <Select value={mode} onValueChange={(value) => setMode(value as AssistantMode)}>
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
            disabled={loading || !user?.id}
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
        <Button
          variant="outline"
          onClick={() => {
            setPrompt("")
            setResponse("")
            setError(null)
          }}
          disabled={loading || !user?.id}
        >
          Clear
        </Button>
        <div className="flex space-x-2">
          {response && (
            <Button type="button" onClick={handleInsert} disabled={!response}>
              Insert
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={loading || !prompt || !user?.id}>
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
