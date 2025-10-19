import { useMutation } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

import { authService } from '../api'
import { mapApiError } from '@/configs/api-error-handler'

/**
 * Hook để handle reset password logic
 * 
 * Đặt lại mật khẩu người dùng bằng token từ email reset
 * Tự động hiển thị notification và yêu cầu người dùng đăng nhập lại
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(payload): Gửi request reset password (token, newPassword, etc.)
 *   - isPending: True khi đang gửi request
 *   - isSuccess: True nếu thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @throws {AxiosError} - Lỗi từ API (invalid token, weak password, etc.)
 *
 * @example
 * const { mutate: resetPassword, isPending } = useResetPassword()
 * 
 * const handleResetPassword = (token: string, newPassword: string) => {
 *   resetPassword(
 *     { token, newPassword },
 *     {
 *       onSuccess: () => {
 *         // Redirect về login page sau 1 giây
 *         setTimeout(() => {
 *           navigate({ to: '/login' })
 *         }, 1000)
 *       }
 *     }
 *   )
 * }
 */
export const useResetPassword = () => {
  return useMutation({
    ...authService.resetPassword,

    onSuccess: () => {
      // Hiển thị success notification
      notifications.show({
        title: 'Đặt lại mật khẩu thành công',
        message: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
        color: 'green',
      })
    },

    onError: (error: Error) => {
      // Map error và hiển thị notification
      const mappedError = mapApiError(error)

      notifications.show({
        title: 'Đặt lại mật khẩu thất bại',
        message: mappedError.message,
        color: 'red',
      })
    },
  })
}
