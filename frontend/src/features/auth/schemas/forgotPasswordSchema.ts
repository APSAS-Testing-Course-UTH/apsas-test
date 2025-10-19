import { z } from 'zod'
import { zIdentityServiceEmailRequest } from '@/api/zod.gen'

// Forgot password schema - chỉ cần email
export const forgotPasswordSchema = zIdentityServiceEmailRequest

// Type inference từ schema
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>