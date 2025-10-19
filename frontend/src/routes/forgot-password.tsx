import { createFileRoute } from "@tanstack/react-router"
import { ForgotPasswordPage } from "../features/auth/pages"

// Route component cho trang quên mật khẩu
export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPasswordPage />
}

