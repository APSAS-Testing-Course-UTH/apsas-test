import { createFileRoute } from "@tanstack/react-router"
import { LoginPage } from "../features/auth/pages"

// Route component cho trang đăng nhập
export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect ? String(search.redirect) : undefined,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { redirect } = Route.useSearch()
  return <LoginPage redirectTo={redirect} />
}