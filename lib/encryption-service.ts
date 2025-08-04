/**
 * Simple encryption service that uses Base64 encoding with a prefix
 * to mark encrypted content. This is not secure encryption but provides
 * basic obfuscation to prevent casual viewing of API keys.
 */

// Prefix to identify encrypted content
const ENCRYPTION_PREFIX = "ENCRYPTED::"

/**
 * Encrypts text using Base64 encoding
 * @param text Text to encrypt
 * @returns Encrypted text
 */
export function encryptText(text: string): string {
  try {
    if (!text) return ""

    // Check if already encrypted
    if (text.startsWith(ENCRYPTION_PREFIX)) {
      return text
    }

    // Simple Base64 encoding
    const encoded = Buffer.from(text).toString("base64")
    return `${ENCRYPTION_PREFIX}${encoded}`
  } catch (error) {
    console.error("Encryption error:", error)
    // Return a marked version of the original text as fallback
    return `${ENCRYPTION_PREFIX}FAILED_ENCRYPTION`
  }
}

/**
 * Decrypts text that was encrypted with encryptText
 * @param encryptedText Encrypted text
 * @returns Decrypted text
 */
export function decryptText(encryptedText: string): string {
  try {
    if (!encryptedText) return ""

    // Check if it's encrypted with our prefix
    if (!encryptedText.startsWith(ENCRYPTION_PREFIX)) {
      return encryptedText
    }

    // Handle failed encryption marker
    if (encryptedText === `${ENCRYPTION_PREFIX}FAILED_ENCRYPTION`) {
      return ""
    }

    // Remove prefix and decode
    const encoded = encryptedText.substring(ENCRYPTION_PREFIX.length)
    return Buffer.from(encoded, "base64").toString()
  } catch (error) {
    console.error("Decryption error:", error)
    return ""
  }
}
