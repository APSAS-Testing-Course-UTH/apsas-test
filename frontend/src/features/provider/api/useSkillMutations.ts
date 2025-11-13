/**
 * Skill API Hooks - Create, Update, Delete
 * Includes error handling and toast notifications
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
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
import { showErrorNotification, showSuccessNotification } from '../utils/errorHandler'

/**
 * Fetch skill by ID
 */
export function useSkillDetailQuery(id: string | null) {
  return useQuery<ContentServiceSkillResponse, AxiosError>({
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
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi tạo kỹ năng', undefined, error)
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
    AxiosError,
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi cập nhật kỹ năng', undefined, error)
    },
  })
}

/**
 * Delete a skill
 */
export function useDeleteSkillMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; name: string }>({
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
    onError: (error: AxiosError) => {
      showErrorNotification('Lỗi xóa kỹ năng', undefined, error)
    },
  })
}
