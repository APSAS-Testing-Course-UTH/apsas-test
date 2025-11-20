import { useQuery } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import { notifications } from '@mantine/notifications'

import { authService } from '../api'
import { useAuthStore } from '../stores/useAuthStore'
import { mapApiError } from '@/configs/api-error-handler'
import type { IdentityServiceUserResponse } from '@/api/types.gen'

/**
 * Hook để fetch current user data từ API
 * 
 * Tự động disable query nếu user chưa authenticated (không có token)
 * Retry logic: Không retry cho 401 errors, tối đa 2 lần cho lỗi khác
 *
 * @returns {UseQueryResult} - TanStack Query result object chứa data, isLoading, error, etc.
 *
 * @example
 * const { data: user, isLoading, error } = useCurrentUser()
 * if (isLoading) return <Loader />
 * if (error) return <ErrorDisplay error={error} />
 * return <UserProfile user={user} />
 */
export const useCurrentUser = () => {
  return useQuery({
    ...authService.getCurrentUser,

    // Chỉ fetch khi có token (authenticated)
    enabled: !!localStorage.getItem('apsas_token'),

    // Retry logic
    retry: (failureCount: number, error: Error) => {
      // Không retry cho 401 errors
      const ApiErrorResponse = error as ApiErrorResponse
      if (ApiErrorResponse?.response?.status === 401) {
        return false
      }
      // Retry tối đa 2 lần cho lỗi khác
      return failureCount < 2
    },
  })
}

/**
 * Utility function để handle current user query result
 * Cập nhật auth store khi fetch thành công hoặc xử lý khi lỗi
 *
 * @param {IdentityServiceUserResponse | undefined} data - User data từ API
 * @param {Error | null} error - Error nếu có (401, network error, etc.)
 * @throws {Error} - Không throw, xử lý error silently trong notifications
 *
 * @example
 * useEffect(() => {
 *   if (status === 'success' || status === 'error') {
 *     handleCurrentUserResult(data, error)
 *   }
 * }, [status, data, error])
 */
export const handleCurrentUserResult = (
  data: IdentityServiceUserResponse | undefined,
  error: Error | null
): void => {
  const { setUser, logout } = useAuthStore.getState()

  if (data) {
    // Update user data trong store
    setUser({
      ...data,
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      displayName: data.firstName || data.email || 'Unknown User',
    })
  }

  if (error) {
    // Nếu 401, token hết hạn → logout
    const mappedError = mapApiError(error)
    const ApiErrorResponse = error as ApiErrorResponse

    if (
      mappedError.code === 'AUTH_FAILED' ||
      mappedError.code === 'HTTP_401' ||
      ApiErrorResponse?.response?.status === 401
    ) {
      logout()

      notifications.show({
        title: 'Phiên đăng nhập hết hạn',
        message: 'Vui lòng đăng nhập lại',
        color: 'orange',
      })
    } else {
      // Log error nhưng không logout
      console.error('Failed to fetch current user:', mappedError)
    }
  }
}
