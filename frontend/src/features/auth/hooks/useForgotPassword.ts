import { useMutation } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

import { authService } from '../api'
import { mapApiError } from '@/configs/api-error-handler'

/**
 * Hook để handle forgot password logic
 * 
 * Gửi email reset mật khẩu đến địa chỉ email được cung cấp
 * Tự động hiển thị notification về kết quả (success/error)
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(email): Gửi request reset password
 *   - isPending: True khi đang gửi request
 *   - isSuccess: True nếu thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @example
 * const { mutate: sendResetEmail, isPending } = useForgotPassword()
 * 
 * const handleSubmit = (email: string) => {
 *   sendResetEmail({ email }, {
 *     onSuccess: () => {
 *       navigate({ to: '/login' })
 *     }
 *   })
 * }
 * 
 * return <form onSubmit={(e) => {
 *   e.preventDefault()
 *   handleSubmit(email)
 * }}>
 *   <input type="email" disabled={isPending} />
 *   <button disabled={isPending}>
 *     {isPending ? 'Đang gửi...' : 'Gửi email reset'}
 *   </button>
 * </form>
 */
export const useForgotPassword = () => {
  return useMutation({
    ...authService.forgotPassword,

    onSuccess: () => {
      // Hiển thị success notification
      notifications.show({
        title: 'Đã gửi email reset mật khẩu',
        message: 'Vui lòng kiểm tra email của bạn để tiếp tục.',
        color: 'green',
      })
    },

    onError: (error: Error) => {
      // Map error và hiển thị notification
      const mappedError = mapApiError(error)

      notifications.show({
        title: 'Gửi email thất bại',
        message: mappedError.message,
        color: 'red',
      })
    },
  })
}
