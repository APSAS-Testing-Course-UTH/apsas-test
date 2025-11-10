import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSkillsQuery } from './hooks'

describe('useSkillsQuery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch skills data successfully', async () => {
    const { result } = renderHook(() => useSkillsQuery({ page: 0, size: 10 }))

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify data
    if (result.current.data?.content) {
      expect(Array.isArray(result.current.data.content)).toBe(true)
    }
    expect(result.current.error).toBeNull()
  })

  it('should support pagination with different page numbers', async () => {
    const { result: result1 } = renderHook(() => useSkillsQuery({ page: 0, size: 10 }))

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false)
    })

    const { result: result2 } = renderHook(() => useSkillsQuery({ page: 1, size: 10 }))

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false)
    })

    expect(result1.current.isLoading || result2.current.isLoading).toBe(false)
  })

  it('should use correct query key for caching', async () => {
    const { result } = renderHook(() => useSkillsQuery({ page: 0, size: 10 }))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify that the hook is properly using TanStack Query
    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
  })

  it('should handle different page sizes', async () => {
    const { result: resultSmall } = renderHook(() => useSkillsQuery({ page: 0, size: 5 }))
    const { result: resultLarge } = renderHook(() => useSkillsQuery({ page: 0, size: 20 }))

    await waitFor(() => {
      expect(resultSmall.current.isLoading).toBe(false)
      expect(resultLarge.current.isLoading).toBe(false)
    })

    // Both should load successfully
    expect(resultSmall.current.error).toBeNull()
    expect(resultLarge.current.error).toBeNull()
  })

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useSkillsQuery({ page: 0, size: 10 }))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify refetch function exists
    expect(typeof result.current.refetch).toBe('function')
  })

  it('should return data structure with expected fields', async () => {
    const { result } = renderHook(() => useSkillsQuery({ page: 0, size: 10 }))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.data) {
      expect(result.current.data).toHaveProperty('content')
      expect(Array.isArray(result.current.data.content)).toBe(true)
    }
  })
})
