import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { RouterContext } from "../router"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  ),
  notFoundComponent: () => <div>Not Found</div>,
})
