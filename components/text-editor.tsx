"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Terminal,
  Bot,
  Table,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AIAssistant } from "@/components/ai-assistant"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  title?: string
  placeholder?: string
  className?: string
}

// List of supported programming languages
const codeLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
]

export function TextEditor({ value, onChange, title, placeholder, className }: TextEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableColumns, setTableColumns] = useState(3)
  const [codeContent, setCodeContent] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { toast } = useToast()

  const handleFormat = (format: string, e?: React.MouseEvent) => {
    // Prevent event propagation to stop form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ""
    let cursorOffset = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorOffset = 4
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorOffset = 2
        break
      case "h1":
        formattedText = `# ${selectedText}`
        cursorOffset = 2
        break
      case "h2":
        formattedText = `## ${selectedText}`
        cursorOffset = 3
        break
      case "h3":
        formattedText = `### ${selectedText}`
        cursorOffset = 4
        break
      case "ul":
        formattedText = `- ${selectedText}`
        cursorOffset = 2
        break
      case "ol":
        formattedText = `1. ${selectedText}`
        cursorOffset = 3
        break
      case "center":
        formattedText = `<div align="center">${selectedText}</div>`
        cursorOffset = 19
        break
      case "right":
        formattedText = `<div align="right">${selectedText}</div>`
        cursorOffset = 18
        break
      case "inlineCode":
        formattedText = `\`${selectedText}\``
        cursorOffset = 2
        break
      default:
        return
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + cursorOffset, start + selectedText.length + cursorOffset)
      }
    }, 0)
  }

  const insertCodeBlock = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!textareaRef.current) return

    const codeBlock = `\`\`\`${codeLanguage}
${codeContent}
\`\`\``

    const textarea = textareaRef.current
    const start = textarea.selectionStart

    const newValue = value.substring(0, start) + codeBlock + value.substring(start)
    onChange(newValue)

    setCodeDialogOpen(false)
    setCodeContent("")
  }

  const insertTable = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!textareaRef.current) return

    // Create table header
    let tableMarkdown = "| "
    for (let i = 0; i < tableColumns; i++) {
      tableMarkdown += `Column ${i + 1} | `
    }
    tableMarkdown += "\n| "

    // Create header separator
    for (let i = 0; i < tableColumns; i++) {
      tableMarkdown += "--- | "
    }
    tableMarkdown += "\n"

    // Create table rows
    for (let i = 0; i < tableRows; i++) {
      tableMarkdown += "| "
      for (let j = 0; j < tableColumns; j++) {
        tableMarkdown += `Cell ${i + 1},${j + 1} | `
      }
      tableMarkdown += "\n"
    }

    const textarea = textareaRef.current
    const start = textarea.selectionStart

    const newValue = value.substring(0, start) + tableMarkdown + value.substring(start)
    onChange(newValue)

    setTableDialogOpen(false)
  }

  const handleInsertText = (text: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart

    const newValue = value.substring(0, start) + text + value.substring(start)
    onChange(newValue)
  }

  const renderPreview = () => {
    // Process code blocks first
    let html = value.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, language, code) => {
      const lang = language || "plaintext"
      return `<pre class="bg-muted p-4 rounded-md overflow-x-auto"><code class="language-${lang}">${escapeHtml(code)}</code></pre>`
    })

    // Process inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')

    // Process images with standard markdown syntax
    html = html.replace(/!\[(.*?)\]$$(.*?)$$/g, (match, alt, src) => {
      // Ensure the src is properly used as-is, whether it's a URL or data URL
      return `<img src="${src}" alt="${alt || ""}" class="max-w-full h-auto rounded-md my-4" />`
    })

    // Process tables
    html = html.replace(/^\|(.+)\|\s*\n\|([-:\s|]+)\|\s*\n((?:\|.+\|\s*\n)+)/gm, (match, header, separator, rows) => {
      const headers = header
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean)
      const alignments = separator
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          if (s.startsWith(":") && s.endsWith(":")) return "center"
          if (s.endsWith(":")) return "right"
          return "left"
        })

      const rowsArray = rows
        .trim()
        .split("\n")
        .map((row) =>
          row
            .split("|")
            .map((cell) => cell.trim())
            .filter(Boolean),
        )

      let tableHtml =
        '<div class="overflow-x-auto my-4"><table class="min-w-full border-collapse border border-border">'

      // Table header
      tableHtml += "<thead><tr>"
      headers.forEach((header, i) => {
        const align = alignments[i] || "left"
        tableHtml += `<th class="border border-border px-4 py-2 text-${align}">${header}</th>`
      })
      tableHtml += "</tr></thead>"

      // Table body
      tableHtml += "<tbody>"
      rowsArray.forEach((row) => {
        tableHtml += "<tr>"
        row.forEach((cell, i) => {
          const align = alignments[i] || "left"
          tableHtml += `<td class="border border-border px-4 py-2 text-${align}">${cell}</td>`
        })
        tableHtml += "</tr>"
      })
      tableHtml += "</tbody></table></div>"

      return tableHtml
    })

    // Process other markdown elements
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.*$)/gm, "<li>$2</li>")
      .replace(/\n\n/g, "<br/><br/>")

    return { __html: html }
  }

  // Helper function to escape HTML
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  return (
    <div className={cn("border rounded-md relative w-full max-w-full flex-1", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("bold", e)}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("italic", e)}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("inlineCode", e)}>
              <Code className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("h1", e)}>
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("h2", e)}>
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("h3", e)}>
              <Heading3 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("ul", e)}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("ol", e)}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("left", e)}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("center", e)}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => handleFormat("right", e)}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />

            {/* Table Dialog */}
            <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setTableDialogOpen(true)
                  }}
                >
                  <Table className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Insert Table</DialogTitle>
                  <DialogDescription>Create a table with the specified number of rows and columns.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rows">Rows</Label>
                      <Input
                        id="rows"
                        type="number"
                        min="1"
                        max="10"
                        value={tableRows}
                        onChange={(e) => setTableRows(Number.parseInt(e.target.value) || 2)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="columns">Columns</Label>
                      <Input
                        id="columns"
                        type="number"
                        min="1"
                        max="10"
                        value={tableColumns}
                        onChange={(e) => setTableColumns(Number.parseInt(e.target.value) || 2)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertTable}>Insert Table</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Code Dialog */}
            <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCodeDialogOpen(true)
                  }}
                >
                  <Terminal className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Insert Code Block</DialogTitle>
                  <DialogDescription>Add a code snippet with syntax highlighting.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Programming Language</Label>
                    <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Textarea
                      id="code"
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="font-mono min-h-[200px]"
                      placeholder="Paste your code here..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCodeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertCodeBlock}>Insert Code</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowAIAssistant(!showAIAssistant)
              }}
              className={showAIAssistant ? "bg-primary/20" : ""}
            >
              <Bot className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="write" className="p-0 m-0 flex-1 flex">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[400px] h-full w-full border-0 focus-visible:ring-0 rounded-none resize-none font-mono text-sm flex-1"
            placeholder={placeholder || "Start writing your chapter content here..."}
          />
        </TabsContent>

        <TabsContent value="preview" className="p-0 m-0 flex-1 overflow-auto">
          <div
            className={cn(
              "min-h-[400px] h-full p-4 prose prose-sm max-w-none overflow-auto",
              "prose-headings:mb-3 prose-headings:mt-4",
              "prose-p:my-2 prose-li:my-0",
            )}
            dangerouslySetInnerHTML={renderPreview()}
          />
        </TabsContent>
      </Tabs>

      {showAIAssistant && (
        <AIAssistant
          context={`The user is writing content for a chapter titled "${title || "Untitled Chapter"}". Current content: ${value.substring(0, 500)}${value.length > 500 ? "..." : ""}`}
          onInsertText={handleInsertText}
          className="z-50"
        />
      )}
    </div>
  )
}

