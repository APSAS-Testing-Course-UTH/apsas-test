import { z } from 'zod'
import { zIdentityServiceLoginRequest } from '@/api/zod.gen'

// Login schema - add Vietnamese error messages
export const loginSchema = zIdentityServiceLoginRequest.extend({
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

// Type inference từ schema
export type LoginFormData = z.infer<typeof loginSchema>