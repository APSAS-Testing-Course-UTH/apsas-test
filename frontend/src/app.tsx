import 'dayjs/locale/vi'
import { MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { DatesProvider } from "@mantine/dates"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/query-client"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/router"
import { env } from "@/configs/env"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AuthProvider, useAuth } from "@/features/auth/components/AuthProvider"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dates/styles.css"

// Validate environment variables khi app khởi động
if (env.VITE_APP_ENV === 'development') {
  console.log('Environment variables validated:', {
    apiUrl: env.VITE_API_BASE_URL,
    appName: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
  })
}

/**
 * Inner App Component
 * Wrapped inside AuthProvider to access auth context
 * Passes auth context to RouterProvider
 */
function InnerApp() {
  // Get auth from context (will be initialized by AuthProvider)
  const auth = useAuth()

  return (
    <>
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
            auth,
          }}
        />
        
        {/* TanStack Router DevTools - Shows route tree, location, matches */}
        <TanStackRouterDevtools 
          router={router}
          initialIsOpen={false}
          position="bottom-left"
        />
        
        {/* TanStack Query DevTools - Shows queries, mutations, cache */}
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      </QueryClientProvider>
    </>
  )
}

/**
 * Root App Component
 * Wraps entire app with providers in correct order:
 * MantineProvider → AuthProvider → InnerApp
 */
export default function App() {
  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'vi', firstDayOfWeek: 1, weekendDays: [0, 6] }}>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </DatesProvider>
    </MantineProvider>
  )
}
