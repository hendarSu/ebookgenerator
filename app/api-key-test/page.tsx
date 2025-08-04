"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { getDecryptedAPIKey } from "@/lib/ai-provider-service"
import { Loader2 } from "lucide-react"

export default function ApiKeyTestPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testApiKey = async () => {
    if (!user) {
      setError("You must be logged in to test the API key")
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log("Testing API key retrieval for user:", user.id)
      const apiKey = await getDecryptedAPIKey(user.id, "openai")

      if (!apiKey) {
        setError("No API key found. Please configure your OpenAI API key in AI Settings.")
      } else {
        // Don't show the full API key for security reasons
        const maskedKey = `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`
        setResult(`API key retrieved successfully: ${maskedKey}`)
      }
    } catch (err: any) {
      console.error("Error testing API key:", err)
      setError(err.message || "An error occurred while testing the API key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Key Test</CardTitle>
            <CardDescription>Test if your OpenAI API key can be retrieved and decrypted correctly</CardDescription>
          </CardHeader>
          <CardContent>
            {!user ? (
              <Alert>
                <AlertDescription>Please log in to test your API key</AlertDescription>
              </Alert>
            ) : (
              <>
                {result && (
                  <Alert className="mb-4">
                    <AlertDescription>{result}</AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testApiKey} disabled={loading || !user}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test API Key"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
