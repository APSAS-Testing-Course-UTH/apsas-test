import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { authService } from '../api'
import { useAuthStore } from '../stores/useAuthStore'
import { mapApiError } from '@/configs/api-error-handler'
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications'
import { ROLE_REDIRECTS } from '@/constants/roles'
import type { UserRole } from '@/types/auth.types'

/**
 * Cấu hình options cho useLogin hook
 * @interface UseLoginOptions
 * @property {string} [redirectTo] - URL tùy chỉnh để redirect sau login (ưu tiên trên role-based redirect)
 */
interface UseLoginOptions {
  redirectTo?: string
}

/**
 * Hook để handle login logic với role-based redirect
 * 
 * Xác thực người dùng qua email/password, lưu token và user data vào auth store
 * Tự động redirect dựa trên role của user hoặc redirectTo parameter
 * 
 * Role-based redirect mapping:
 * - STUDENT → /student/dashboard
 * - INSTRUCTOR → /instructor/dashboard
 * - CONTENT_PROVIDER → /provider/dashboard
 * - ADMIN → /login (admin portal is server-side)
 *
 * @param {UseLoginOptions} [options] - Cấu hình hook
 * @param {string} [options.redirectTo] - URL tùy chỉnh để redirect (không được là /login hoặc /register)
 *
 * @returns {UseMutationResult} - TanStack React Query mutation object
 *   - mutate(credentials): Gửi credentials (email, password)
 *   - isPending: True khi đang đăng nhập
 *   - isSuccess: True nếu đăng nhập thành công
 *   - isError: True nếu có lỗi
 *   - error: Error object nếu có
 *
 * @throws {AxiosError} - Lỗi từ API (invalid credentials, account disabled, etc.)
 *
 * @example
 * const { mutate: login, isPending, isError, error } = useLogin()
 * 
 * const handleLogin = (email: string, password: string) => {
 *   login({ email, password })
 * }
 * 
 * // Với redirectTo custom
 * const { mutate: login } = useLogin({ redirectTo: '/assignments' })
 */

export const useLogin = ({ redirectTo }: UseLoginOptions = {}) => {
  const { login: loginStore } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login.mutationFn,

    onSuccess: (data) => {
      // Validate response data
      if (!data.user) {
        throw new Error('Invalid login response: missing user data')
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

      // Lưu auth data vào store
      loginStore(authResponse)

      // Hiển thị success notification
      showSuccessNotification('Chào mừng bạn quay trở lại!', 'Đăng nhập thành công')

      // Xác định redirect URL dựa trên role
      // Priority: redirectTo (if valid) > role-based redirect > home
      let finalRedirectUrl = '/'
      
      if (data.user.role) {
        const userRole = data.user.role as UserRole
        finalRedirectUrl = ROLE_REDIRECTS[userRole] || '/'
      }

      // Nếu có redirectTo query param, sử dụng nó
      if (redirectTo && !redirectTo.includes('/login') && !redirectTo.includes('/register')) {
        finalRedirectUrl = redirectTo
      }

      // ✅ FIX: Delay navigation until next tick to ensure auth context updates
      // This fixes the race condition where navigate() runs before AuthProvider re-renders
      // Without this, router's beforeLoad checks stale context.auth.isAuthenticated (still false)
      queueMicrotask(() => {
        navigate({ to: finalRedirectUrl, replace: true })
      })
    },

    onError: (error: Error) => {
      // Map error và hiển thị notification
      const mappedError = mapApiError(error)

      showErrorNotification(mappedError.message, 'Đăng nhập thất bại')
    },
  })
}