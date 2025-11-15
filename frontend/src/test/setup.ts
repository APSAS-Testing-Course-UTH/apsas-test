// vitest test setup - runs after jsdom environment created
// All imports are lazy-loaded to avoid "document is not defined" errors
/// <reference types="@testing-library/jest-dom" />
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'

// Extend vitest expect with jest-dom matchers
expect.extend(jestDomMatchers)

// Global module mock: Mock useToast before any component imports occur so
// tests that import components using useToast receive a safe mock implementation.
vi.mock('@/components/hooks/useToast', () => {
  const makeMock = () => ({
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    close: vi.fn(),
    closeAll: vi.fn(),
  })

  return {
    useToast: makeMock,
    default: makeMock,
  }
})

// Also mock the notifications helper (some modules import notifications.show directly)
vi.mock('@/utils/notifications', () => {
  const makeMock = () => ({
    show: vi.fn(),
    showSuccessNotification: vi.fn(),
    showErrorNotification: vi.fn(),
    showInfoNotification: vi.fn(),
    showWarningNotification: vi.fn(),
  })

  return {
    showNotification: makeMock().show,
    showSuccessNotification: makeMock().showSuccessNotification,
    showErrorNotification: makeMock().showErrorNotification,
    showInfoNotification: makeMock().showInfoNotification,
    showWarningNotification: makeMock().showWarningNotification,
    default: makeMock,
  }
})

// Provide a minimal mock for TanStack Router hooks used in components/tests.
// Some tests rely on useNavigate() existing; provide a safe no-op implementation.
vi.mock('@tanstack/react-router', () => {
  return {
    useNavigate: () => vi.fn(),
    // Provide noop components for RouterProvider/RootRoute when tests import them
    RouterProvider: ({ children }: any) => children,
    RootRoute: (opts: any) => ({ component: opts?.component ?? (() => null) }),
    Router: (opts: any) => ({ routeTree: opts?.routeTree ?? null }),
  }
})

console.log('🔧 [Test Setup] Lazy-loading test DOM configuration...')

// Store references for deferred imports
let cleanup: any
// Matchers are imported/extended in test setup

// CRITICAL: Store MSW server globally so it persists across test suites
declare global {
  var __MSW_SERVER__: any
}

// Add custom matcher for CSS Module classes
interface CustomMatchers<R = unknown> {
  toHaveCSSModuleClass(className: string): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Phase 1: Setup before all tests (with timeout protection)
beforeAll(async () => {
  console.log('[Test Setup] Starting beforeAll hook...')
  const startTime = Date.now()

  try {
    // Step 1: Setup DOM mocks (now safe since jsdom is initialized)
    console.log('[Test Setup] Setting up DOM mocks...')

    // Mock window.matchMedia for Mantine (required for MantineProvider)
    if (typeof window !== 'undefined') {
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
    }

    // Mock ResizeObserver for Mantine ScrollArea component
    if (typeof global !== 'undefined') {
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }))
    }

    // Ensure Mantine shared portal node is present for portal-based components
    if (typeof document !== 'undefined') {
      const existing = document.querySelector('[data-mantine-shared-portal-node]')
      if (!existing) {
        const portal = document.createElement('div')
        portal.setAttribute('data-mantine-shared-portal-node', 'true')
        portal.setAttribute('data-portal', 'true')
        document.body.appendChild(portal)
        console.log('[Test Setup] ✅ Mantine portal node appended to document.body')
      }
    }

    // Mock localStorage
    if (typeof globalThis !== 'undefined') {
      const localStorageMock = (() => {
        let store: Record<string, string> = {}

        return {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value.toString()
          },
          removeItem: (key: string) => {
            delete store[key]
          },
          clear: () => {
            store = {}
          },
          key: (index: number) => Object.keys(store)[index] || null,
          get length() {
            return Object.keys(store).length
          },
        }
      })()

      if (typeof window !== 'undefined') {
        try {
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
            configurable: true,
          })
        } catch (e) {
          // Silently ignore if we can't redefine it
        }
      }
      
      try {
        Object.defineProperty(globalThis, 'localStorage', {
          value: localStorageMock,
          writable: true,
          configurable: true,
        })
      } catch (e) {
        // Silently ignore if we can't redefine it
      }
    }

    console.log('[Test Setup] ✅ DOM mocks configured')

    // Step 2: Lazy-load cleanup function
    console.log('[Test Setup] Loading cleanup function...')
    const testingLibraryReact = await import('@testing-library/react')
    cleanup = testingLibraryReact.cleanup
    console.log('[Test Setup] ✅ Cleanup loaded')

    // Step 3: Add custom matcher for CSS Module classes
    expect.extend({
      toHaveCSSModuleClass(element: HTMLElement, className: string) {
        const classList = Array.from(element.classList)
        const hasClass = classList.some(cls => cls.includes(className))

        return {
          pass: hasClass,
          message: () =>
            `expected element ${hasClass ? 'not ' : ''}to have class containing "${className}"\nReceived: ${element.className}`,
        }
      },
    })

    console.log('[Test Setup] ✅ Custom matchers added')

    // Step 4: Install undici fetch if needed
    if (!globalThis.fetch || globalThis.fetch.name !== 'fetch' || globalThis.fetch.toString().includes('native')) {
      console.log('[Test Setup] Installing undici fetch...')
      const { fetch: undiciFetch } = await import('undici')
      globalThis.fetch = undiciFetch as any
      console.log('[Test Setup] ✅ undici fetch installed')
    } else {
      console.log('[Test Setup] Using existing fetch:', globalThis.fetch.name)
    }

    // Step 5: Initialize MSW server if not already initialized
    if (!globalThis.__MSW_SERVER__) {
      console.log('[Test Setup] Initializing MSW server for first time...')
      const { server } = await import('@/mocks/server')

      // Start the server
      server.listen({ onUnhandledRequest: 'warn' })
      globalThis.__MSW_SERVER__ = server
      console.log('[Test Setup] ✅ MSW server started and stored globally')
    } else {
      console.log('[Test Setup] MSW server already initialized, reusing...')
      globalThis.__MSW_SERVER__.resetHandlers()
    }

    // Step 6: Initialize localStorage with test token
    if (typeof localStorage !== 'undefined') {
      const testToken = 'student_student-001'
      localStorage.setItem('apsas_token', testToken)
      console.log('[Test Setup] ✅ localStorage initialized with test token')
    }

    // Step 7: Configure SDK client with auth interceptor for tests
    const { client } = await import('@/api/client.gen')
    client.interceptors.request.use(async (request) => {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('apsas_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      }
      return request
    })
    console.log('[Test Setup] ✅ SDK client auth interceptor configured')

        // (useToast is mocked globally above to avoid timing issues)

    const totalDuration = Date.now() - startTime
    console.log(`[Test Setup] ✅ beforeAll hook completed in ${totalDuration}ms`)
  } catch (error) {
    console.error('[Test Setup] ❌ beforeAll hook failed:', error)
    throw error
  }
}, 30000) // Set explicit 30s timeout for this hook

// Phase 2: Cleanup after each test
afterEach(() => {
  if (cleanup) {
    cleanup()
  }
  vi.clearAllMocks()
  // Don't clear localStorage completely - just ensure token is available for next test
  if (typeof localStorage !== 'undefined') {
    const testToken = 'student_student-001'
    localStorage.setItem('apsas_token', testToken)
  }
  // Reset MSW handlers for next test
  if (globalThis.__MSW_SERVER__) {
    globalThis.__MSW_SERVER__.resetHandlers()
  }
})

// Phase 3: Close server after all tests
afterAll(() => {
  if (globalThis.__MSW_SERVER__) {
    globalThis.__MSW_SERVER__.close()
  }
})

// Import the custom render function with providers
import { render as customRender } from '../test-utils'

// Export testing utilities for test files
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { vi } from 'vitest'
export { customRender as render }
