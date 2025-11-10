import { useMutation } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

import { identityServiceResendVerificationEmailMutation } from '@/api/@tanstack/react-query.gen'
import { mapApiError } from '@/configs/api-error-handler'

/**
 * Hook để gửi lại email xác minh
 *
 * Gửi lại liên kết xác minh email nếu người dùng không nhận được email ban đầu
 * Được gọi từ verify email page hoặc forgot password flow
 * Tự động hiển thị notification về kết quả
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(email): Gửi lại email xác minh
 *   - isPending: True khi đang gửi
 *   - isSuccess: True nếu gửi thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @throws {AxiosError} - Lỗi từ API (invalid email, rate limited, etc.)
 *
 * @example
 * // Trong verify email page/component
 * const { mutate: resendEmail, isPending } = useResendVerificationEmail()
 *
 * const handleResend = (email: string) => {
 *   resendEmail(
 *     { body: { email } },
 *     {
 *       onSuccess: () => {
 *         console.log('Email verification sent')
 *       }
 *     }
 *   )
 * }
 *
 * return (
 *   <button onClick={() => handleResend(email)} disabled={isPending}>
 *     {isPending ? 'Đang gửi...' : 'Gửi lại email'}
 *   </button>
 * )
 */
export const useResendVerificationEmail = () => {
  return useMutation({
    ...identityServiceResendVerificationEmailMutation(),

    onSuccess: () => {
      // Hiển thị success notification
      notifications.show({
        title: 'Email gửi thành công',
        message: 'Vui lòng kiểm tra hộp thư đến và nhấp vào liên kết xác minh email.',
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
