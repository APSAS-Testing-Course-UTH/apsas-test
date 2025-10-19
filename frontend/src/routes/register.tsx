import { createFileRoute } from "@tanstack/react-router"
import { RegisterPage } from "../features/auth/pages"

// Route component cho trang đăng ký
export const Route = createFileRoute("/register")({
  component: RouteComponent,
})

function RouteComponent() {
  return <RegisterPage />
}

