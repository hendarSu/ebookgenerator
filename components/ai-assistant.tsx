"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Bot, Send, Sparkles, Loader2, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type AssistantMode, streamAssistantResponse } from "@/lib/ai-assistant-service"

interface AIAssistantProps {
  context?: string
  onInsertText?: (text: string) => void
  className?: string
}

export function AIAssistant({ context, onInsertText, className }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<AssistantMode>("writer")
  const [history, setHistory] = useState<Array<{ prompt: string; response: string }>>([])
  const responseRef = useRef<HTMLDivElement>(null)

  const assistantModes = [
    { value: "writer", label: "Creative Writer" },
    { value: "editor", label: "Editor" },
    { value: "researcher", label: "Researcher" },
    { value: "summarizer", label: "Summarizer" },
    { value: "translator", label: "Translator" },
  ]

  const modeDescriptions: Record<AssistantMode, string> = {
    writer: "Helps with creative writing, storytelling, and dialogue",
    editor: "Improves grammar, clarity, and style",
    researcher: "Provides information and facts on various topics",
    summarizer: "Condenses text while preserving key points",
    translator: "Assists with language translation",
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setResponse("")

    try {
      await streamAssistantResponse(prompt, mode, context, (chunk) => {
        setResponse((prev) => prev + chunk)

        // Auto-scroll to bottom of response
        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight
        }
      })

      // Add to history after completion
      setHistory((prev) => [...prev, { prompt, response }])
      setPrompt("")
    } catch (error) {
      console.error("Error:", error)
      setResponse("Sorry, I encountered an error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (onInsertText && response) {
      onInsertText(response)
      setResponse("")
    }
  }

  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setResponse("")
    setPrompt("")
  }

  // Quick prompts based on the selected mode
  const getQuickPrompts = (): string[] => {
    switch (mode) {
      case "writer":
        return [
          "Write a descriptive paragraph about...",
          "Create dialogue between two characters who...",
          "Develop a plot twist where...",
          "Describe a setting for a scene where...",
        ]
      case "editor":
        return [
          "Improve the clarity of this paragraph",
          "Make this text more concise",
          "Suggest a better way to phrase this",
          "Fix grammar and style issues in this text",
        ]
      case "researcher":
        return [
          "Provide information about...",
          "What are the key facts about...",
          "Explain the concept of...",
          "What's the historical context of...",
        ]
      case "summarizer":
        return [
          "Summarize this text in one paragraph",
          "Create bullet points from this content",
          "Condense this information for a quick overview",
          "Extract the main ideas from this text",
        ]
      case "translator":
        return [
          "Translate this text to Spanish",
          "How would you say this in French?",
          "Convert this technical language to simple terms",
          "Rewrite this for a younger audience",
        ]
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`} onClick={(e) => e.stopPropagation()}>
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 w-12 shadow-lg">
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 md:w-96 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>{modeDescriptions[mode]}</CardDescription>
            <Select value={mode} onValueChange={(value) => setMode(value as AssistantMode)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select assistant mode" />
              </SelectTrigger>
              <SelectContent>
                {assistantModes.map((assistantMode) => (
                  <SelectItem key={assistantMode.value} value={assistantMode.value}>
                    {assistantMode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-1">
              {getQuickPrompts()
                .slice(0, 2)
                .map((quickPrompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPrompt(quickPrompt)
                    }}
                  >
                    {quickPrompt.length > 20 ? quickPrompt.substring(0, 20) + "..." : quickPrompt}
                  </Button>
                ))}
            </div>

            {/* Response area */}
            {response && (
              <div
                ref={responseRef}
                className="bg-muted/50 rounded-md p-3 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm"
              >
                {response}
              </div>
            )}

            {/* Insert button */}
            {response && onInsertText && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={(e) => handleClear(e)}>
                  Clear
                </Button>
                <Button size="sm" onClick={(e) => handleInsert(e)}>
                  <Sparkles className="mr-2 h-3 w-3" />
                  Insert
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything..."
                className="min-h-9 resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSubmit()
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={isLoading || !prompt.trim()}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSubmit()
                }}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

