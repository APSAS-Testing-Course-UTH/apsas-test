import { routeTree } from "./routeTree.gen"

import { createRouter } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export interface RouterContext {
  queryClient: QueryClient
}

export const router = createRouter({ routeTree, context: undefined! })
