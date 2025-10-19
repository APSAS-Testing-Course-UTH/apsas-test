import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useAuthStore } from '../stores/useAuthStore'
import { ROLE_REDIRECTS } from '@/constants/roles'

/**
 * Hook để handle role-based redirect sau login
 * Tự động điều hướng người dùng đến dashboard của role của họ
 *
 * @returns {string | null} - Redirect path của user dựa trên role, hoặc null nếu chưa authenticated
 *
 * @example
 * const redirectPath = useRoleRedirect()
 * // Tự động redirect nếu user đã authenticated
 * // Hoặc có thể dùng redirectPath để hiển thị thông tin
 */
export const useRoleRedirect = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Chỉ redirect nếu user đã authenticated và có role
    if (isAuthenticated && user?.role) {
      try {
        const redirectPath = ROLE_REDIRECTS[user.role]

        // Đảm bảo redirectPath hợp lệ trước khi navigate
        if (redirectPath) {
          // Navigate đến dashboard tương ứng với role
          // Sử dụng replace=true để không thêm vào browser history
          navigate({
            to: redirectPath,
            replace: true,
          }).catch((error) => {
            console.error('Navigation failed:', error)
            // Fallback: redirect về root nếu có lỗi
            navigate({ to: '/', replace: true }).catch(() => {
              // Silent fail nếu cả navigation về root cũng thất bại
              console.warn('Failed to redirect to root path')
            })
          })
        } else {
          // Role không tìm thấy trong ROLE_REDIRECTS mapping
          console.warn(`No redirect path configured for role: ${user.role}`)
        }
      } catch (error) {
        console.error('Error in useRoleRedirect:', error)
      }
    }
  }, [isAuthenticated, user?.role, navigate])

  // Return current redirect path (có thể dùng để preview hoặc debug)
  return user?.role ? ROLE_REDIRECTS[user.role] : null
}
