import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/useAuthStore'
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications'
import { useCallback } from 'react'

/**
 * Hook để handle logout logic
 * 
 * Xóa auth state từ store, clear token từ localStorage, và redirect về login page
 * Hiển thị notification khi logout thành công hoặc có lỗi
 * 
 * @returns {Object} - Logout handler object
 *   - logout: async function để gọi logout
 *   - isLoggingOut: boolean state (always false vì logout là synchronous)
 *   - error: error state (always null vì logout không throw)
 *
 * @example
 * const { logout } = useLogout()
 * 
 * const handleLogout = async () => {
 *   try {
 *     await logout()
 *     // Navigation happens automatically
 *   } catch (error) {
 *     // Error handling
 *   }
 * }
 */
export const useLogout = () => {
  const { logout: logoutStore, user } = useAuthStore()
  const navigate = useNavigate()

  /**
   * Execute logout operation
   * - Clear auth store (user, token, isAuthenticated)
   * - Clear localStorage
   * - Show success notification
   * - Redirect to login page
   */
  const logout = useCallback(async () => {
    try {
      const userDisplayName = user?.firstName || user?.email || 'Người dùng'

      // Clear auth state từ store
      // Zustand logout function clears state synchronously
      logoutStore()

      // Hiển thị success notification
      showSuccessNotification(
        `Tạm biệt ${userDisplayName}!`,
        'Bạn đã đăng xuất thành công'
      )

      // Redirect về login page
      // Use replace: true để không thể back lại authenticated routes
      navigate({
        to: '/login',
        replace: true,
        search: { redirect: undefined }, // Clear any redirect params
      })
    } catch (error) {
      // Handle unexpected errors
      console.error('Logout error:', error)
      
      // Hiển thị error notification
      showErrorNotification(
        'Lỗi khi đăng xuất',
        error instanceof Error ? error.message : 'Có lỗi xảy ra'
      )

      // Try to logout anyway even if navigation fails
      logoutStore()
    }
  }, [logoutStore, user, navigate])

  return {
    logout,
    isLoggingOut: false, // logout is synchronous
    error: null, // logout doesn't produce errors
  }
}
