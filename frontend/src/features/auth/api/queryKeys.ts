/**
 * Auth Query Keys
 * 
 * Centralized query key factory for authentication and user data.
 * Follows TanStack Query best practices for hierarchical key structure.
 * 
 * @example
 * ```typescript
 * // Fetch current user
 * useQuery({ queryKey: authKeys.currentUser(), ... })
 * 
 * // Fetch user by ID
 * useQuery({ queryKey: authKeys.detail(userId), ... })
 * 
 * // Invalidate current user
 * queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
 * 
 * // Invalidate all user data
 * queryClient.invalidateQueries({ queryKey: authKeys.all })
 * ```
 */

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  details: () => [...authKeys.all, 'detail'] as const,
  detail: (id: string) => [...authKeys.details(), id] as const,
}
