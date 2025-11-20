/**
 * useSkillsQuery Hook
 * Fetches paginated list of skills
 *
 * Usage:
 * const { data, isLoading } = useSkillsQuery({ page: 0, size: 10 })
 */

import { useQuery } from '@tanstack/react-query'
import type { ApiErrorResponse } from '@/configs/api-error-handler'
import type { ContentServicePageResponseSkillResponse } from '@/api/types.gen'
import { contentServiceGetAllSkills } from '@/api/sdk.gen'

export const skillQueryKeys = {
  all: ['skills'] as const,
  lists: () => [...skillQueryKeys.all, 'list'] as const,
  list: (filters: { page: number; size: number }) =>
    [...skillQueryKeys.lists(), filters] as const,
  details: () => [...skillQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...skillQueryKeys.details(), id] as const,
}

export function useSkillsQuery({
  page = 0,
  size = 10,
}: { page?: number; size?: number } = {}) {
  return useQuery<
    ContentServicePageResponseSkillResponse,
    ApiErrorResponse,
    ContentServicePageResponseSkillResponse,
    readonly ['skills', 'list', { page: number; size: number }]
  >({
    queryKey: ['skills', 'list', { page, size }] as const,
    queryFn: async () => {
      const response = await contentServiceGetAllSkills({
        query: { page: String(page), size: String(size) },
      })
      return response.data || (response as any)
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
  })
}
