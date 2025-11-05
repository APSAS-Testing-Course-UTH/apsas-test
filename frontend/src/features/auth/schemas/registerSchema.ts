import { z } from 'zod'
import { zIdentityServiceRegisterRequest } from '@/api/zod.gen'
import { USER_ROLES } from '@/constants/roles'

/**
 * Register schema - only STUDENT role is allowed to register
 * Extends generated schema with custom validation
 */
export const registerSchema = zIdentityServiceRegisterRequest.extend({
  // Add custom Vietnamese messages for generated fields
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  firstName: z.string().min(1, 'Họ là bắt buộc').max(100, 'Họ không được quá 100 ký tự'),
  lastName: z.string().min(1, 'Tên là bắt buộc').max(100, 'Tên không được quá 100 ký tự'),

  // Add confirm password field
  confirmPassword: z.string().min(8, 'Mật khẩu xác nhận phải có ít nhất 8 ký tự'),

  // Add terms agreement
  agreeToTerms: z.boolean().refine(
    (val) => val === true,
    'Bạn phải đồng ý với điều khoản sử dụng'
  ),
}).refine(
  // Validate password === confirmPassword
  (data) => data.password === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  }
).transform((data) => {
  // Force role to STUDENT only for registration
  return {
    ...data,
    role: USER_ROLES.STUDENT,
  }
})

// Type inference từ schema
export type RegisterFormData = z.infer<typeof registerSchema>