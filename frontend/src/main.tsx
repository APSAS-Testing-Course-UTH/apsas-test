import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles.css"
import App from "@/app"

// CRITICAL: Import client and configure it
import { client } from '@/api/client.gen'

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
  if (import.meta.env.DEV) {
    const { startWorker } = await import('./mocks/browser')
    await startWorker()
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startApp()
