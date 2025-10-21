import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from '@/mocks/server'

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

beforeAll(() => {
  // Setup global mocks
  Object.defineProperty(global, 'window', {
    value: {
      localStorage: localStorageMock,
    },
    writable: true,
  })

  // Mock global localStorage for MSW handlers
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Mock window.matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Start MSW server for testing
  server.listen({
    onUnhandledRequest: 'error',
  })
})

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})