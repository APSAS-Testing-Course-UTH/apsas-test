import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'
import { handlers } from './handlers'
import { logDataConsistency } from './factory/mockDataRegistry'

export const worker = setupWorker(
  ...handlers,
  // Catch-all handler for unhandled requests (only API calls)
  http.all('*/api/*', ({ request }) => {
    const url = new URL(request.url)
    
    // Log unhandled API requests
    console.warn(`[MSW] Unhandled ${request.method} request to ${url.pathname}`)
    
    // For WebSocket endpoints, return a 404 (they need actual WebSocket server)
    if (url.pathname.includes('/ws/') || url.pathname.includes('sockjs')) {
      return HttpResponse.json({ error: 'WebSocket not available in mock' }, { status: 404 })
    }
    
    // For other unhandled API requests, return error
    return HttpResponse.json(
      { error: 'No mock handler for this request', path: url.pathname },
      { status: 501 }
    )
  })
)

export const startWorker = async () => {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    console.log('🚀 MSW browser worker started')
    // Verify mock data consistency across all services
    logDataConsistency()
  }
}

export const stopWorker = () => {
  worker.stop()
}