import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/query-client"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/router"
import { env } from "@/configs/env"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"

// Validate environment variables khi app khởi động
if (env.VITE_APP_ENV === 'development') {
  console.log('Environment variables validated:', {
    apiUrl: env.VITE_API_BASE_URL,
    appName: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
  })
}

export default function App() {
  return (
    <MantineProvider>
      <Notifications
        position="top-right"
        zIndex={1000}
        autoClose={5000}
        limit={3}
      />
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          context={{
            queryClient,
          }}
        />
      </QueryClientProvider>
    </MantineProvider>
  )
}
