import { useMutation } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'

import { authService } from '../api'
import { mapApiError } from '@/configs/api-error-handler'

/**
 * Hook để handle verify email logic
 * 
 * Xác minh email người dùng bằng token từ email verification
 * Được gọi khi người dùng click vào link verification trong email
 * Tự động hiển thị notification về kết quả
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(token): Xác minh email bằng token
 *   - isPending: True khi đang xác minh
 *   - isSuccess: True nếu xác minh thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @throws {AxiosError} - Lỗi từ API (invalid token, expired token, already verified, etc.)
 *
 * @example
 * // Trong verify email page/component
 * const { mutate: verifyEmail, isPending } = useVerifyEmail()
 * 
 * useEffect(() => {
 *   // Lấy token từ URL params
 *   const token = searchParams.get('token')
 *   if (token) {
 *     verifyEmail(token, {
 *       onSuccess: () => {
 *         // Redirect về login sau 2 giây
 *         setTimeout(() => {
 *           navigate({ to: '/login' })
 *         }, 2000)
 *       }
 *     })
 *   }
 * }, [searchParams])
 * 
 * if (isPending) return <Loader />
 * if (isSuccess) return <SuccessMessage />
 * if (isError) return <ErrorMessage error={error} />
 */
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: authService.verifyEmail.mutationFn,

    onSuccess: () => {
      // Hiển thị success notification
      notifications.show({
        title: 'Xác minh email thành công',
        message: 'Email của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ.',
        color: 'green',
      })
    },

    onError: (error: Error) => {
      // Map error và hiển thị notification
      const mappedError = mapApiError(error)

      notifications.show({
        title: 'Xác minh email thất bại',
        message: mappedError.message,
        color: 'red',
      })
    },
  })
}
