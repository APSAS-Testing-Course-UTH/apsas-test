import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles.css"
import App from "@/app"

// CRITICAL: Import client and configure it
import { client } from '@/api/client.gen'
import { router } from '@/router'
import { queryClient } from '@/query-client'
import { initializeAuth } from '@/features/auth/stores/useAuthStore'
import { mapApiError } from '@/configs/api-error-handler'
import { env } from '@/configs/env'

// Configure client base URL for MSW (dev) or production API
// Use VITE_API_BASE_URL from env (validated by Zod)
client.setConfig({
  baseUrl: env.VITE_API_BASE_URL,
})

// Setup auth interceptor - add JWT token to requests
client.interceptors.request.use(async (request) =>  {
  const token = localStorage.getItem('apsas_token')

  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }

  // Log requests in debug mode
  if (env.VITE_ENABLE_DEVTOOLS) {
    console.log('🚀 [API Request]', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    })
  }

  return request
})

// Setup response interceptor - log successful responses in debug mode
client.interceptors.response.use((response) => {
  if (env.VITE_ENABLE_DEVTOOLS) {
    console.log('✅ [API Response]', {
      status: response.status,
      url: response.url,
    })
  }
  return response
})

// Setup error interceptor - handle API errors globally
// Note: The 'error' parameter is the already-parsed ProblemDetail object from the API
// Structure: { type, title, status, detail, instance, ...extensions }
client.interceptors.error.use(async (error, response) => {
  // Wrap ProblemDetail in hey-api error structure for mapApiError compatibility
  const wrappedError = {
    response: {
      status: response.status,
      statusText: response.statusText,
    },
    error, // This is the ProblemDetail object
  }
  
  const mappedError = mapApiError(wrappedError)

  // Log errors in debug mode
  if (env.VITE_ENABLE_DEVTOOLS) {
    console.error('❌ [API Error]', {
      problemDetail: error, // Raw ProblemDetail
      mapped: {
        message: mappedError.message,
        code: mappedError.code,
        details: mappedError.details,
        timestamp: mappedError.timestamp,
      },
    })
  }

  // For 401 errors, clear auth and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('apsas_token')
    localStorage.removeItem('apsas_user')

    // Redirect to login (if not already there)
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  // Return the original error (ProblemDetail) to maintain consistency
  // with the hey-api client error handling
  return error
})

async function startApp() {
  initializeAuth()

  // Only start MSW if explicitly enabled via environment variable
  const enableMSW = import.meta.env.VITE_ENABLE_MSW === 'true'

  if (import.meta.env.DEV && enableMSW) {
    console.log('🔴 MSW Enabled: Using mock API responses')
    const { startWorker } = await import('./mocks/browser')
    await startWorker()
  } else if (import.meta.env.DEV) {
    console.log('✅ MSW Disabled: Connecting to real Backend API')

    // Register Firebase Messaging Service Worker for push notifications
    if ('serviceWorker' in navigator) {
      // if (false) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js', {
            scope: '/',
            updateViaCache: 'none', // Always fetch fresh SW
          })
          .then((registration) => {
            console.log('[ServiceWorker] Firebase Messaging SW registered:', registration.scope)

            // Listen for Service Worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                console.log('[ServiceWorker] New version found, installing...')
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    console.log('[ServiceWorker] New version activated')
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('[ServiceWorker] Firebase Messaging SW registration failed:', error)
          })
      })
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startApp()

// Type definitions for TypeScript
declare global {
  interface Window {
    router?: typeof router
    queryClient?: typeof queryClient
    debugState?: () => void
    debugRoutes?: () => void
    clearCaches?: () => void
    debugQueryCache?: () => void
    debugMutationCache?: () => void
    debugQueryKeys?: () => void
  }
}
