import { z } from 'zod'
import { zIdentityServiceLoginRequest } from '@/api/zod.gen'

// Login schema - sử dụng generated schema trực tiếp
// Không cần custom validation vì backend đã validate email format và password min 1 char
export const loginSchema = zIdentityServiceLoginRequest

// Type inference từ schema
export type LoginFormData = z.infer<typeof loginSchema>