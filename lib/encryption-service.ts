import crypto from "crypto"

// Get encryption key and IV from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || ""

// Validate encryption key and IV
if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  console.warn("Warning: ENCRYPTION_KEY or ENCRYPTION_IV environment variables are not set.")
}

// Convert hex string to buffer
const getKeyBuffer = () => {
  try {
    return Buffer.from(ENCRYPTION_KEY, "hex")
  } catch (error) {
    console.error("Invalid ENCRYPTION_KEY format. It should be a hex string.")
    throw new Error("Invalid encryption configuration")
  }
}

// Convert hex string to buffer
const getIVBuffer = () => {
  try {
    return Buffer.from(ENCRYPTION_IV, "hex")
  } catch (error) {
    console.error("Invalid ENCRYPTION_IV format. It should be a hex string.")
    throw new Error("Invalid encryption configuration")
  }
}

// Encrypt text
export function encryptText(text: string): string {
  try {
    if (!text) return ""

    const key = getKeyBuffer()
    const iv = getIVBuffer()

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

// Decrypt text
export function decryptText(encryptedText: string): string {
  try {
    if (!encryptedText) return ""

    const key = getKeyBuffer()
    const iv = getIVBuffer()

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}
