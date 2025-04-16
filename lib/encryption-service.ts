/**
 * Simple encryption service for API keys
 * Uses a basic encryption method that's compatible with server environments
 */

// Simple encryption function that doesn't rely on environment variables
export function encryptText(text: string): string {
  try {
    if (!text) return ""

    // Simple base64 encoding with a prefix to identify it's encrypted
    // This is not secure encryption but prevents casual viewing of API keys
    // For production, use a proper encryption library with secure keys
    return "ENC:" + Buffer.from(text).toString("base64")
  } catch (error) {
    console.error("Encryption error:", error)
    // Return a marked version of the original text instead of throwing
    return "FAILED_ENC:" + text
  }
}

// Simple decryption function
export function decryptText(encryptedText: string): string {
  try {
    if (!encryptedText) return ""

    // Check if it's our encrypted format
    if (encryptedText.startsWith("ENC:")) {
      // Decode the base64 string
      return Buffer.from(encryptedText.substring(4), "base64").toString()
    }

    // If it starts with our failure marker, return the original text
    if (encryptedText.startsWith("FAILED_ENC:")) {
      return encryptedText.substring(11)
    }

    // If it's not in our format, return as is
    return encryptedText
  } catch (error) {
    console.error("Decryption error:", error)
    // Return the original text if decryption fails
    return encryptedText
  }
}
