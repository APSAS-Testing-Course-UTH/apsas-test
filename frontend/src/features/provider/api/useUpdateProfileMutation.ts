import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showNotification } from '@/utils/notifications'
import { identityServiceUpdateCurrentUserProfile } from '@/api/sdk.gen'
import type { IdentityServiceUpdateProfileRequest } from '@/api/types.gen'

interface UpdateProfileInput extends IdentityServiceUpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

/**
 * useUpdateProfileMutation Hook
 * Cập nhật thông tin hồ sơ người dùng
 *
 * @returns Mutation object với mutate và loading state
 *
 * @example
 * const { mutate: updateProfile } = useUpdateProfileMutation()
 * updateProfile({ firstName: 'John', lastName: 'Doe' })
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const result = await identityServiceUpdateCurrentUserProfile({
        body: data,
      })
      if (result.error) throw result.error
      if (!result.data) throw new Error('No data returned from API')
      return result.data
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })

      // Show success notification
      showNotification('Cập nhật hồ sơ thành công', 'success', 'Thành công')
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Lỗi cập nhật hồ sơ'
      showNotification(message, 'error', 'Lỗi')
    },
  })
}
