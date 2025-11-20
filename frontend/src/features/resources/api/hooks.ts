import { useQuery } from '@tanstack/react-query'
import { 
  contentServiceGetAllTutorials,
  contentServiceGetTutorialById,
  contentServiceGetAllSkills,
  contentServiceGetSkillById,
} from '@/api/sdk.gen'
import type { 
  ContentServicePageResponseTutorialResponse,
  ContentServiceTutorialResponse,
  ContentServicePageResponseSkillResponse,
  ContentServiceSkillResponse,
} from '@/api/types.gen'
import { resourceKeys } from './queryKeys'

interface UseTutorialsOptions {
  page?: number
  size?: number
}

interface UseSkillsOptions {
  page?: number
  size?: number
}

/**
 * Hook to fetch all available tutorials with pagination
 * 
 * @param options - Query options (page, size)
 * @returns TanStack Query result with tutorials data
 */
export function useTutorials({ page = 0, size = 10 }: UseTutorialsOptions = {}) {
  return useQuery<ContentServicePageResponseTutorialResponse | undefined>({
    queryKey: resourceKeys.tutorials.list({ page, size }),
    queryFn: async () => {
      const response = await contentServiceGetAllTutorials({
        query: { page: String(page), size: String(size) },
      })
      return response.data as ContentServicePageResponseTutorialResponse | undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook to fetch all available skills with pagination
 * 
 * Fetches skills from Content Service with support for:
 * - Pagination (page, size)
 * - Caching (5 min stale, 30 min GC)
 * - Error handling
 * 
 * @param options - Query options (page, size)
 * @returns TanStack Query result with skills data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSkillsQuery({ page: 0, size: 10 })
 * ```
 */
export function useSkillsQuery({ page = 0, size = 10 }: UseSkillsOptions = {}) {
  return useQuery<ContentServicePageResponseSkillResponse | undefined>({
    queryKey: resourceKeys.skills.list({ page, size }),
    queryFn: async () => {
      const response = await contentServiceGetAllSkills({
        query: { page: String(page), size: String(size) },
      })
      return response.data as ContentServicePageResponseSkillResponse | undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook to fetch a single skill by ID
 * 
 * Fetches individual skill details from Content Service.
 * Only fetches when skillId is provided (enabled: !!skillId)
 * 
 * @param skillId - UUID of the skill
 * @returns TanStack Query result with skill data (null if not provided)
 * 
 * @example
 * ```tsx
 * const { data: skill, isLoading } = useSkillDetailQuery(skillId)
 * ```
 */
export function useSkillDetailQuery(skillId?: string) {
  return useQuery<ContentServiceSkillResponse | null, Error>({
    queryKey: resourceKeys.skills.detail(skillId || 'none'),
    queryFn: async () => {
      if (!skillId) return null

      const response = await contentServiceGetSkillById({
        path: { id: skillId },
      })

      if (response.error) {
        throw response.error
      }

      return response.data || null
    },
    enabled: !!skillId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Hook to fetch a single tutorial by ID
 * 
 * Fetches individual tutorial details from Content Service.
 * Only fetches when tutorialId is provided (enabled: !!tutorialId)
 * 
 * @param tutorialId - UUID of the tutorial
 * @returns TanStack Query result with tutorial data (null if not provided)
 * 
 * @example
 * ```tsx
 * const { data: tutorial, isLoading } = useTutorialDetailQuery(tutorialId)
 * ```
 */
export function useTutorialDetailQuery(tutorialId?: string) {
  return useQuery<ContentServiceTutorialResponse | null, Error>({
    queryKey: resourceKeys.tutorials.detail(tutorialId || 'none'),
    queryFn: async () => {
      if (!tutorialId) return null

      const response = await contentServiceGetTutorialById({
        path: { id: tutorialId },
      })

      if (response.error) {
        throw response.error
      }

      return response.data || null
    },
    enabled: !!tutorialId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}
