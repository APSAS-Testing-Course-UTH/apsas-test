/**
 * useSkillsQuery Hook
 * Fetches paginated list of skills
 *
 * Usage:
 * const { data, isLoading } = useSkillsQuery({ page: 0, size: 10 })
 */

import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ContentServicePageResponseSkillResponse } from '@/api/types.gen'
import { contentServiceGetAllSkills } from '@/api/sdk.gen'

export const skillQueryKeys = {
  all: ['skills'] as const,
  lists: () => [...skillQueryKeys.all, 'list'] as const,
  list: (filters: { page: number; size: number; sort: string }) =>
    [...skillQueryKeys.lists(), filters] as const,
  details: () => [...skillQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...skillQueryKeys.details(), id] as const,
}

export function useSkillsQuery({
  page = 0,
  size = 10,
  sort = 'createdAt:DESC',
}: { page?: number; size?: number; sort?: string } = {}) {
  return useQuery<
    ContentServicePageResponseSkillResponse,
    AxiosError,
    ContentServicePageResponseSkillResponse,
    readonly ['skills', 'list', { page: number; size: number; sort: string }]
  >({
    queryKey: ['skills', 'list', { page, size, sort }] as const,
    queryFn: async () => {
      const response = await contentServiceGetAllSkills({
        query: { page: String(page), size: String(size), sort },
      })
      return response.data || (response as any)
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
  })
}
