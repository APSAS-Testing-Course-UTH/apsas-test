import { z } from 'zod'
import { zIdentityServiceResetPasswordRequest } from '@/api/zod.gen'

// Reset password schema - extend generated schema với confirm password
export const resetPasswordSchema = zIdentityServiceResetPasswordRequest.extend({
  // Thêm confirm password field
  confirmPassword: z.string().min(8, 'Mật khẩu xác nhận phải có ít nhất 8 ký tự'),
}).refine(
  // Validate newPassword === confirmPassword
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Error sẽ hiển thị ở confirmPassword field
  }
)

// Type inference từ schema
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>