import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { authService } from '../api'
import { useAuthStore } from '../stores/useAuthStore'
import { mapApiError } from '@/configs/api-error-handler'
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications'
import { ROLE_REDIRECTS, USER_ROLES } from '@/constants/roles'

/**
 * Hook để handle register logic
 * 
 * Đăng ký tài khoản sinh viên mới, tự động đăng nhập sau khi đăng ký thành công
 * Email xác minh sẽ được gửi sau khi đăng ký
 * 
 * IMPORTANT:
 * - Chỉ cho phép STUDENT role đăng ký (các role khác không thể tự đăng ký)
 * - Auto-login sau khi đăng ký thành công
 * - Redirect đến /student/dashboard (role STUDENT luôn đi đến đây)
 * - Email xác minh sẽ được gửi đến địa chỉ email đăng ký
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(userData): Gửi registration data (email, password, firstName, lastName, etc.)
 *   - isPending: True khi đang đăng ký
 *   - isSuccess: True nếu đăng ký thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @throws {AxiosError} - Lỗi từ API (email already exists, invalid data, weak password, etc.)
 *
 * @example
 * const { mutate: register, isPending } = useRegister()
 * 
 * const handleRegister = (formData: RegisterFormData) => {
 *   register(formData)
 * }
 * 
 * return (
 *   <form onSubmit={(e) => {
 *     e.preventDefault()
 *     handleRegister(formData)
 *   }}>
 *     <input type="email" disabled={isPending} />
 *     <input type="password" disabled={isPending} />
 *     <button disabled={isPending}>
 *       {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
 *     </button>
 *   </form>
 * )
 */
export const useRegister = () => {
  const { login: loginStore } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    ...authService.register,

    onSuccess: (data) => {
      // Validate response data
      if (!data.user) {
        throw new Error('Invalid register response: missing user data')
      }

      // Verify registered user has STUDENT role
      if (data.user.role !== USER_ROLES.STUDENT) {
        throw new Error('Registration is only available for Student role')
      }

      // Transform response to match AuthResponse type
      const authResponse = {
        ...data,
        user: {
          ...data.user,
          fullName: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
          displayName: data.user.firstName || data.user.email || 'Unknown User',
        }
      }

      // Tự động login sau khi register thành công
      loginStore(authResponse)

      // Hiển thị success notification
      showSuccessNotification(
        'Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh.',
        'Đăng ký thành công'
      )

      // Redirect đến student dashboard (STUDENT role luôn redirect tới đây)
      navigate({ to: ROLE_REDIRECTS[USER_ROLES.STUDENT], replace: true })
    },

    onError: (error: Error) => {
      // Map error và hiển thị notification
      const mappedError = mapApiError(error)

      showErrorNotification(mappedError.message, 'Đăng ký thất bại')
    },
  })
}