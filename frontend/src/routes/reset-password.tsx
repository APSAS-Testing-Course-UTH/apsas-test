import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"
import { ResetPasswordPage } from "../features/auth/pages"

// Schema để validate search params
const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
})



// Route component cho trang đặt lại mật khẩu với token validation
export const Route = createFileRoute("/reset-password")({
  validateSearch: zodValidator(resetPasswordSearchSchema),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  return <ResetPasswordPage token={token} />
}
