import { MantineProvider } from "@mantine/core"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/query-client"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "@/router"
import "@mantine/core/styles.css"

export default function App() {
  return (
    <MantineProvider>
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
