/**
 * Environment Setup for Tests
 * This file runs first to initialize jsdom globals
 * MUST BE SYNCHRONOUS - vitest loads setup files synchronously
 */

// Manually initialize jsdom if needed (for Bun test runner or when vitest doesn't initialize it)
if (typeof window === 'undefined' || typeof document === 'undefined') {
  try {
    // Use require for synchronous loading
    // @ts-ignore - require doesn't exist in ESM but works at runtime
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    Object.assign(global, {
      window: dom.window,
      document: dom.window.document,
      navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement,
      Element: dom.window.Element,
      Node: dom.window.Node,
      DOMException: dom.window.DOMException,
    })
    console.log('[env-setup] ✅ jsdom globals manually initialized')
  } catch (error) {
    console.warn('[env-setup] ⚠️ Failed to initialize jsdom:', error)
  }
}

// Import jest-dom matchers (must happen after document is defined)
import '@testing-library/jest-dom/matchers'

console.log('[env-setup] ✅ jest-dom matchers loaded')
console.log('[env-setup] ✅ jest-dom matchers loaded')
