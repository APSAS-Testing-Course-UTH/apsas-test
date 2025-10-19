import { z } from 'zod'
import { zIdentityServiceTokenRequest } from '@/api/zod.gen'

// Verify email schema - chỉ cần token
export const verifyEmailSchema = zIdentityServiceTokenRequest

// Type inference từ schema
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>