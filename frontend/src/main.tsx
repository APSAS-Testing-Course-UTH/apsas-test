import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles.css"
import App from "@/app"

// CRITICAL: Import client and configure it
import { client } from '@/api/client.gen'
import { router } from '@/router'
import { queryClient } from '@/query-client'
import { initializeAuth } from '@/features/auth/stores/useAuthStore'

// Configure client base URL for MSW (dev) or production API
// In DEV mode, use http://localhost:8080 to match MSW handlers and OpenAPI specs
// In PROD mode, use VITE_API_BASE_URL from env
const baseUrl = import.meta.env.DEV ? 'http://localhost:8080' : (import.meta.env.VITE_API_BASE_URL || '')
client.setConfig({ baseUrl })

// Setup auth interceptor
client.interceptors.request.use(async (request) => {
  const token = localStorage.getItem('apsas_token')
  
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  
  return request
})

// Start MSW in development and wait for it to be ready before rendering
async function startApp() {
  // 🔴 CRITICAL: Initialize auth from localStorage FIRST, before rendering app
  // This ensures auth state is ready before Router's beforeLoad hooks run
  initializeAuth()
  
  if (import.meta.env.DEV) {
    const { startWorker } = await import('./mocks/browser')
    await startWorker()
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  // Expose debugging helpers to window in development
  if (import.meta.env.DEV) {
    // Router instance for manual navigation
    window.router = router
    
    // QueryClient for cache inspection
    window.queryClient = queryClient
    
    // Helper to log current state
    window.debugState = () => {
      console.group('📊 Debug State')
      console.log('Router State:', router.state)
      console.log('Router Location:', router.state.location)
      console.log('Query Cache:', queryClient.getQueryCache())
      console.log('Query Cache Size:', queryClient.getQueryCache().getAll().length)
      console.log('Mutation Cache:', queryClient.getMutationCache())
      console.log('Mutation Cache Size:', queryClient.getMutationCache().getAll().length)
      console.groupEnd()
    }
    
    // Helper to inspect router tree
    window.debugRoutes = () => {
      console.group('🗺️ Route Tree')
      console.log('All Routes:', router.flatRoutes)
      console.log('Route Tree:', router.routeTree)
      console.groupEnd()
    }
    
    // Helper to clear caches
    window.clearCaches = () => {
      queryClient.clear()
      console.log('✅ Caches cleared')
    }

    // Helper to inspect query cache details
    window.debugQueryCache = () => {
      console.group('🔍 Query Cache Details')
      const queries = queryClient.getQueryCache().getAll()
      queries.forEach((query: any) => {
        const key = query.queryKey?.join('/') || 'unknown'
        console.log(`Query: ${key}`, {
          status: query.state.status,
          data: query.state.data,
          dataUpdatedAt: new Date(query.state.dataUpdatedAt),
          error: query.state.error,
          errorUpdatedAt: query.state.errorUpdatedAt ? new Date(query.state.errorUpdatedAt) : null,
        })
      })
      console.groupEnd()
    }

    // Helper to inspect mutation cache details
    window.debugMutationCache = () => {
      console.group('🔍 Mutation Cache Details')
      const mutations = queryClient.getMutationCache().getAll()
      mutations.forEach((mutation: any, idx: number) => {
        console.log(`Mutation ${idx + 1}`, {
          status: mutation.state.status,
          data: mutation.state.data,
          error: mutation.state.error,
        })
      })
      console.groupEnd()
    }

    // Helper to list all cached query keys
    window.debugQueryKeys = () => {
      console.group('🔑 Cached Query Keys')
      const queries = queryClient.getQueryCache().getAll()
      queries.forEach((query: any) => {
        const key = query.queryKey?.join('/') || 'unknown'
        const status = query.state.status
        console.log(`${key} [${status}]`)
      })
      console.groupEnd()
    }
    
    console.log('🎯 Debug tools available:')
    console.log('  window.debugState() - Show router & cache state')
    console.log('  window.debugRoutes() - Show route tree')
    console.log('  window.debugQueryCache() - Show query cache details')
    console.log('  window.debugMutationCache() - Show mutation cache details')
    console.log('  window.debugQueryKeys() - List all cached query keys')
    console.log('  window.clearCaches() - Clear all caches')
  }
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
