import { routeTree } from "./routeTree.gen"

import { createRouter } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import type { AuthContextType } from "@/features/auth/components/AuthProvider"

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export interface RouterContext {
  queryClient: QueryClient
  auth: AuthContextType
}

export const router = createRouter({ 
  routeTree, 
  context: undefined!,
  defaultPreload: 'intent',
})
