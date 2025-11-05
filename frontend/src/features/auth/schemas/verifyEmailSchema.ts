import { z } from 'zod'
import { zIdentityServiceTokenRequest } from '@/api/zod.gen'

// Verify email schema - add Vietnamese error messages
export const verifyEmailSchema = zIdentityServiceTokenRequest.extend({
  token: z.string().min(1, 'Token là bắt buộc'),
})

// Type inference từ schema
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>