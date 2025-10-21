import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/styles.css"
import App from "@/app"

// Start MSW in development
if (process.env.NODE_ENV === 'development') {
  import('./mocks/browser').then(({ startWorker }) => {
    startWorker()
  })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
