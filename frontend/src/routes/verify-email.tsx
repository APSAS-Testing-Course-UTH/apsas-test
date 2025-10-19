import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"
import { VerifyEmailPage } from "../features/auth/pages"

// Schema để validate search params
const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
})



// Route component cho trang xác minh email với token validation
export const Route = createFileRoute("/verify-email")({
  validateSearch: zodValidator(verifyEmailSearchSchema),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  return <VerifyEmailPage token={token} />
}
