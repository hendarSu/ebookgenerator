"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getProviderSettings, saveProviderSettings, deleteProviderSettings } from "@/lib/ai-provider-service"

export default function AISettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [openAISettings, setOpenAISettings] = useState({
    apiKey: "",
    model: "gpt-3.5-turbo",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      loadSettings()
    }
  }, [isAuthenticated, authLoading, router])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const settings = await getProviderSettings("openai")
      if (settings) {
        setOpenAISettings({
          apiKey: settings.apiKey ? "••••••••••••••••••••••••••" : "",
          model: settings.model || "gpt-3.5-turbo",
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error loading settings",
        description: "Failed to load your AI provider settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Don't save if the API key is masked (unchanged)
      if (openAISettings.apiKey === "••••••••••••••••••••••••••") {
        toast({
          title: "No changes to save",
          description: "Your API key remains unchanged.",
        })
        setIsSaving(false)
        return
      }

      // Validate API key
      if (!openAISettings.apiKey) {
        toast({
          title: "API key required",
          description: "Please enter your OpenAI API key.",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      await saveProviderSettings("openai", {
        apiKey: openAISettings.apiKey,
        model: openAISettings.model,
      })

      toast({
        title: "Settings saved",
        description: "Your OpenAI settings have been saved successfully.",
      })

      // Mask the API key after saving
      setOpenAISettings({
        ...openAISettings,
        apiKey: "••••••••••••••••••••••••••",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error saving settings",
        description: error instanceof Error ? error.message : "Failed to save your settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsSaving(true)
      await deleteProviderSettings("openai")

      setOpenAISettings({
        apiKey: "",
        model: "gpt-3.5-turbo",
      })

      toast({
        title: "Settings deleted",
        description: "Your OpenAI settings have been removed.",
      })
    } catch (error) {
      console.error("Error deleting settings:", error)
      toast({
        title: "Error deleting settings",
        description: "Failed to delete your settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Provider Settings</h1>
        <p className="text-muted-foreground mb-8">
          Configure your AI provider settings to use with the AI assistant. Your API keys are encrypted before being
          stored.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>OpenAI</CardTitle>
            <CardDescription>
              Configure your OpenAI API key and model. You can get an API key from the{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:text-sky-600 underline"
              >
                OpenAI dashboard
              </a>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-api-key">API Key</Label>
              <Input
                id="openai-api-key"
                type="password"
                placeholder="sk-..."
                value={openAISettings.apiKey}
                onChange={(e) => setOpenAISettings({ ...openAISettings, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai-model">Model</Label>
              <Select
                value={openAISettings.model}
                onValueChange={(value) => setOpenAISettings({ ...openAISettings, model: value })}
              >
                <SelectTrigger id="openai-model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleDelete} disabled={isSaving || !openAISettings.apiKey}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !openAISettings.apiKey}
              className="bg-sky-500 hover:bg-sky-600"
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </CardFooter>
        </Card>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Note about Google Gemini</h3>
          <p className="text-sm text-muted-foreground">
            Support for Google Gemini will be added in a future update. Currently, only OpenAI is supported.
          </p>
        </div>
      </div>
    </div>
  )
}
