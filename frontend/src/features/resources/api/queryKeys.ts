/**
 * Resource Query Keys
 * 
 * Centralized query key factory for resources (tutorials and skills).
 * Follows TanStack Query best practices for hierarchical key structure.
 * 
 * @example
 * ```typescript
 * // Fetch all tutorials
 * useQuery({ queryKey: resourceKeys.tutorials.lists(), ... })
 * 
 * // Fetch paginated tutorials
 * useQuery({ queryKey: resourceKeys.tutorials.list({ page: 0, size: 10 }), ... })
 * 
 * // Fetch single tutorial
 * useQuery({ queryKey: resourceKeys.tutorials.detail(id), ... })
 * 
 * // Invalidate all tutorial lists
 * queryClient.invalidateQueries({ queryKey: resourceKeys.tutorials.lists() })
 * 
 * // Invalidate all resources
 * queryClient.invalidateQueries({ queryKey: resourceKeys.all })
 * ```
 */

interface PaginationParams {
  page: number
  size: number
}

export const resourceKeys = {
  all: ['resources'] as const,
  
  // Tutorials
  tutorials: {
    all: () => [...resourceKeys.all, 'tutorials'] as const,
    lists: () => [...resourceKeys.tutorials.all(), 'list'] as const,
    list: (params: PaginationParams) => [...resourceKeys.tutorials.lists(), params] as const,
    details: () => [...resourceKeys.tutorials.all(), 'detail'] as const,
    detail: (id: string) => [...resourceKeys.tutorials.details(), id] as const,
  },
  
  // Skills
  skills: {
    all: () => [...resourceKeys.all, 'skills'] as const,
    lists: () => [...resourceKeys.skills.all(), 'list'] as const,
    list: (params: PaginationParams) => [...resourceKeys.skills.lists(), params] as const,
    details: () => [...resourceKeys.skills.all(), 'detail'] as const,
    detail: (id: string) => [...resourceKeys.skills.details(), id] as const,
  },
}
