import { useQuery } from '@tanstack/react-query'
import { contentServiceGetAllSkillsOptions } from '@/api/@tanstack/react-query.gen'
import type { ContentServiceSkillResponse, ContentServicePageResponseSkillResponse } from '@/api/types.gen'

// Query keys factory
export const skillKeys = {
  all: ['skills'] as const,
  lists: () => [...skillKeys.all, 'list'] as const,
  list: (params?: { page?: number; size?: number }) => [...skillKeys.lists(), params] as const,
  details: () => [...skillKeys.all, 'detail'] as const,
  detail: (id: string) => [...skillKeys.details(), id] as const,
}

/**
 * Hook to fetch all available skills with pagination
 * 
 * @param page - Page number (0-indexed)
 * @param size - Number of items per page
 * @returns Query result with skills list
 */
export function useAllSkills(page: number = 0, size: number = 100) {
  return useQuery<ContentServicePageResponseSkillResponse>({
    ...contentServiceGetAllSkillsOptions({
      query: {
        page: String(page),
        size: String(size),
      },
    }),
    queryKey: skillKeys.list({ page, size }),
    staleTime: 10 * 60 * 1000, // 10 minutes - skills don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to get all skills as a flat array
 * Useful for displaying a simple list of all skills
 * 
 * Returns object with skills array and status
 */
export function useSkillsList() {
  const { data, isLoading, error } = useAllSkills(0, 1000)
  
  const skills: ContentServiceSkillResponse[] = data?.content ?? []
  
  return {
    skills,
    isLoading,
    error: error instanceof Error ? error : null,
    total: data?.totalElements ?? 0,
  }
}
