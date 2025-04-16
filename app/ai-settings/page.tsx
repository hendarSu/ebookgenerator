"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { getProviderSettings, saveProviderSettings, deleteProviderSettings } from "@/lib/ai-provider-service"

type ProviderSetting = {
  id?: string
  provider: string
  apiKey: string
  model: string
}

const openAIModels = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
]

export default function AISettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<ProviderSetting[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadSettings()
    }
  }, [user, authLoading, router])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const openaiSettings = await getProviderSettings("openai")

      const allSettings: ProviderSetting[] = []

      if (openaiSettings) {
        allSettings.push({
          id: openaiSettings.id,
          provider: "openai",
          apiKey: "••••••••••••••••••••••••••", // Masked for security
          model: openaiSettings.model,
        })
      }

      setSettings(allSettings)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load AI provider settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProvider = (provider: string) => {
    // Check if provider already exists
    if (settings.some((s) => s.provider === provider)) {
      toast({
        title: "Error",
        description: `${provider === "openai" ? "OpenAI" : "Gemini"} settings already exist`,
        variant: "destructive",
      })
      return
    }

    setSettings([
      ...settings,
      {
        provider,
        apiKey: "",
        model: provider === "openai" ? "gpt-4o" : "",
      },
    ])
  }

  const handleRemoveProvider = async (index: number) => {
    const setting = settings[index]
    if (setting.id) {
      try {
        await deleteProviderSettings(setting.provider)
        toast({
          title: "Success",
          description: `${setting.provider === "openai" ? "OpenAI" : "Gemini"} settings removed`,
        })
      } catch (error) {
        console.error("Error deleting settings:", error)
        toast({
          title: "Error",
          description: "Failed to remove provider settings",
          variant: "destructive",
        })
        return
      }
    }

    const newSettings = [...settings]
    newSettings.splice(index, 1)
    setSettings(newSettings)
  }

  const handleChange = (index: number, field: keyof ProviderSetting, value: string) => {
    const newSettings = [...settings]
    newSettings[index] = { ...newSettings[index], [field]: value }
    setSettings(newSettings)
  }

  const handleSave = async (index: number) => {
    const setting = settings[index]

    if (!setting.apiKey) {
      toast({
        title: "Validation Error",
        description: "API key is required",
        variant: "destructive",
      })
      return
    }

    if (!setting.model) {
      toast({
        title: "Validation Error",
        description: "Model is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const savedSetting = await saveProviderSettings({
        provider: setting.provider,
        apiKey: setting.apiKey,
        model: setting.model,
      })

      const newSettings = [...settings]
      newSettings[index] = {
        ...newSettings[index],
        id: savedSetting.id,
        apiKey: "••••••••••••••••••••••••••", // Mask the API key after saving
      }
      setSettings(newSettings)

      toast({
        title: "Success",
        description: `${setting.provider === "openai" ? "OpenAI" : "Gemini"} settings saved`,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save provider settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Provider Settings</h1>
        <p className="text-muted-foreground">Configure your AI provider settings to use with the AI assistant.</p>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <div className="space-y-6">
            {settings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No AI providers configured yet.</p>
                </CardContent>
              </Card>
            ) : (
              settings.map((setting, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>OpenAI</CardTitle>
                    <CardDescription>Configure your OpenAI API key and model</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`apiKey-${index}`}>API Key</Label>
                      <Input
                        id={`apiKey-${index}`}
                        type="password"
                        value={setting.apiKey}
                        onChange={(e) => handleChange(index, "apiKey", e.target.value)}
                        placeholder={setting.id ? "Enter new API key to update" : "Enter your API key"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your API key from the{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:underline"
                        >
                          OpenAI dashboard
                        </a>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`model-${index}`}>Model</Label>
                      <Select value={setting.model} onValueChange={(value) => handleChange(index, "model", value)}>
                        <SelectTrigger id={`model-${index}`}>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {openAIModels.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveProvider(index)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    <Button
                      onClick={() => handleSave(index)}
                      disabled={isSaving}
                      className="bg-sky-500 hover:bg-sky-600"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}

            {settings.length === 0 && (
              <Button variant="outline" onClick={() => handleAddProvider("openai")} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add OpenAI
              </Button>
            )}

            <div className="mt-8 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Note</h3>
              <p className="text-sm text-muted-foreground">
                Currently, only OpenAI integration is supported. Gemini integration will be added in a future update.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
