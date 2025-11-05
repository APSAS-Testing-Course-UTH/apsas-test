import { z } from 'zod'
import { zIdentityServiceEmailRequest } from '@/api/zod.gen'

// Forgot password schema - add Vietnamese error messages
export const forgotPasswordSchema = zIdentityServiceEmailRequest.extend({
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
})

// Type inference từ schema
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>