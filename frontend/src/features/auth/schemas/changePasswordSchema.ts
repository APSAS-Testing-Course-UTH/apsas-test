import { z } from 'zod'
import { zIdentityServiceChangePasswordRequest } from '@/api/zod.gen'

// Change password schema - extend generated schema với confirm password
export const changePasswordSchema = zIdentityServiceChangePasswordRequest.extend({
  // Thêm confirm password field
  confirmPassword: z.string().min(8, 'Mật khẩu xác nhận phải có ít nhất 8 ký tự'),
}).refine(
  // Validate newPassword === confirmPassword
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // Error sẽ hiển thị ở confirmPassword field
  }
).refine(
  // Validate newPassword !== currentPassword
  (data) => data.newPassword !== data.currentPassword,
  {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'], // Error sẽ hiển thị ở newPassword field
  }
)

// Type inference từ schema
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>