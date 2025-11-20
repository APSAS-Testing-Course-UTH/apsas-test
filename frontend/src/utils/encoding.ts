/**
 * Encoding utilities for Base64 conversion
 * 
 * Handles proper UTF-8 encoding using TextEncoder/TextDecoder
 * to support Unicode characters (Vietnamese, emojis, etc.)
 * 
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/btoa#unicode_strings
 */

/**
 * Encode text to Base64
 * Properly handles Unicode/UTF-8 characters using TextEncoder
 * 
 * @param text - Plain text string to encode
 * @returns Base64 encoded string
 * 
 * @example
 * ```typescript
 * const encoded = encodeToBase64('Hello World');
 * // Returns: "SGVsbG8gV29ybGQ="
 * 
 * const vietnameseEncoded = encodeToBase64('Xin chào 🎉');
 * // Returns: "WGluIGNow6BvIPCfjonp"
 * ```
 */
export function encodeToBase64(text: string): string {
  // Use TextEncoder for proper UTF-8 handling (supports Unicode)
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(text)
  
  // Convert Uint8Array to binary string
  const binaryString = Array.from(uint8Array)
    .map((byte) => String.fromCodePoint(byte))
    .join('')
  
  // Encode to Base64 using native btoa()
  return btoa(binaryString)
}

/**
 * Decode Base64 to text
 * Properly handles Unicode/UTF-8 characters using TextDecoder
 * 
 * @param base64 - Base64 encoded string
 * @returns Decoded plain text string
 * 
 * @example
 * ```typescript
 * const decoded = decodeFromBase64('SGVsbG8gV29ybGQ=');
 * // Returns: "Hello World"
 * 
 * const vietnameseDecoded = decodeFromBase64('WGluIGNow6BvIPCfjonp');
 * // Returns: "Xin chào 🎉"
 * ```
 */
export function decodeFromBase64(base64: string): string {
  // Decode Base64 to binary string using native atob()
  const binaryString = atob(base64)
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  // Decode Uint8Array to text using TextDecoder (UTF-8)
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}
