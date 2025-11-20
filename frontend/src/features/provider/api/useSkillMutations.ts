/**
 * Skill API Hooks - Create, Update, Delete
 * Includes error handling and toast notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type {
  ContentServiceSkillResponse,
} from '@/api/types.gen'
import {
  contentServiceCreateSkill,
  contentServiceUpdateSkill,
  contentServiceDeleteSkill,
  contentServiceGetSkillById,
} from '@/api/sdk.gen'
import { skillQueryKeys } from './useSkillsQuery'
import { 
  handleApiError,
  showErrorNotification, 
  showSuccessNotification 
} from '@/configs/api-error-handler'

/**
 * Fetch skill by ID
 */
export function useSkillDetailQuery(id: string | null) {
  return useQuery<ContentServiceSkillResponse, ApiErrorResponse>({
    queryKey: skillQueryKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Skill ID required')
      const response = await contentServiceGetSkillById({ path: { id } })
      return response.data as ContentServiceSkillResponse
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Create a new skill
 */
export function useCreateSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceSkillResponse,
    ApiErrorResponse,
    { name: string; description?: string }
  >({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await contentServiceCreateSkill({
        body: data,
      })
      return response.data as ContentServiceSkillResponse
    },
    onSuccess: (newSkill) => {
      // Show success notification
      showSuccessNotification('Tạo kỹ năng', `Kỹ năng "${newSkill.name}" đã được tạo thành công`)
      
      // Invalidate the skills list to refetch
      queryClient.invalidateQueries({
        queryKey: skillQueryKeys.lists(),
      })
      // Add the new skill to the cache
      queryClient.setQueryData(skillQueryKeys.detail(newSkill.id!), newSkill)
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi tạo kỹ năng')
    },
  })
}

/**
 * Update an existing skill
 */
export function useUpdateSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    ContentServiceSkillResponse,
    ApiErrorResponse,
    { id: string; data: { name: string; description?: string } }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await contentServiceUpdateSkill({
        path: { id },
        body: data,
      })
      return response.data as ContentServiceSkillResponse
    },
    onSuccess: (updatedSkill, { id }) => {
      // Show success notification
      showSuccessNotification('Cập nhật kỹ năng', `Kỹ năng "${updatedSkill.name}" đã được cập nhật`)
      
      // Update cache with new data
      queryClient.setQueryData(skillQueryKeys.detail(id), updatedSkill)
      // Invalidate the list to show updated data
      queryClient.invalidateQueries({
        queryKey: skillQueryKeys.lists(),
      })
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi cập nhật kỹ năng')
    },
  })
}

/**
 * Delete a skill
 */
export function useDeleteSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiErrorResponse, { id: string; name: string }>({
    mutationFn: async ({ id }) => {
      await contentServiceDeleteSkill({ path: { id } })
    },
    onSuccess: (_, { id, name }) => {
      // Show success notification
      showSuccessNotification('Xóa kỹ năng', `Kỹ năng "${name}" đã được xóa`)
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: skillQueryKeys.detail(id) })
      // Invalidate the list
      queryClient.invalidateQueries({
        queryKey: skillQueryKeys.lists(),
      })
    },
    onError: (error: ApiErrorResponse) => {
      const errorMessage = handleApiError(error)
      showErrorNotification(errorMessage, 'Lỗi xóa kỹ năng')
    },
  })
}
