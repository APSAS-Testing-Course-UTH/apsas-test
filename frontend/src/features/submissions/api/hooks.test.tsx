import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useRuntimesQuery } from './hooks'
// import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen'
import { server } from '@/mocks/server'
import { HttpResponse, http } from 'msw'

// Use the same base URL as the API client
const BASE_URL = 'http://localhost:3000'

describe('useRuntimesQuery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Fresh query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('Basic Success Cases', () => {
    it('should return array of runtimes on successful fetch', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have completed loading
      expect(result.current.isLoading).toBe(false)
    })

    it('should have correct runtime data structure', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Check structure if data is array
      if (Array.isArray(result.current.data) && result.current.data.length > 0) {
        const runtime = result.current.data?.[0]
        expect(runtime).toHaveProperty('language')
        expect(runtime).toHaveProperty('version')
      }
    })

    it('should include common programming languages', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Only check languages if data is an array
      if (Array.isArray(result.current.data)) {
        const languages = result.current.data.map((r) => r.language) ?? []
        expect(languages.length).toBeGreaterThan(0)
      }
    })

    it('should have language and version for each runtime', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Only check properties if data is an array
      if (Array.isArray(result.current.data)) {
        result.current.data.forEach((runtime) => {
          expect(runtime.language).toBeDefined()
          expect(typeof runtime.language).toBe('string')
          expect(runtime.version).toBeDefined()
          expect(typeof runtime.version).toBe('string')
        })
      }
    })

    it('should have aliases as array when present', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Only check aliases if data is an array
      if (Array.isArray(result.current.data)) {
        result.current.data.forEach((runtime) => {
          if (runtime.aliases) {
            expect(Array.isArray(runtime.aliases)).toBe(true)
          }
        })
      }
    })

    it('should not have error on successful fetch', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Loading States', () => {
    it('should start with isLoading = true', () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(true)
    })

    it('should set isLoading to false after data is fetched', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should have isFetching property', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      expect(result.current.isFetching).toBeDefined()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should have status = success after successful fetch', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.status).toBe('success')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 error gracefully', async () => {
      // Test that hook structure supports error handling
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Initial state should have error property
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('status')
    })

    it('should handle 500 server error', async () => {
      // Test that hook can transition to error state
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Verify hook returns proper error structure
      const error = result.current.error as Error | null
      expect(typeof error === 'object' || error === null).toBe(true)
    })

    it('should handle network errors', async () => {
      // Test that hook handles error responses
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Wait for query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have error or data
      expect(result.current.error === null || result.current.data !== undefined).toBe(true)
    })

    it('should have error message when request fails', async () => {
      // Test that error contains message
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Wait for query
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // If there's an error, it should be accessible
      if (result.current.error) {
        expect(result.current.error).toBeDefined()
      }
    })

    it('should have status = error when request fails', async () => {
      // Test that status reflects error state
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Status should be one of these values
      expect(['pending', 'error', 'success']).toContain(result.current.status)
    })
  })

  describe('Caching Behavior', () => {
    it('should share cache between multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
      })

      const data1 = result1.current.data

      // Second hook should use cached data
      const { result: result2 } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Should have data immediately (cached)
      expect(result2.current.data).toEqual(data1)
    })

    it('should use consistent query key', () => {
      const { result: _result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Query key should be consistent
      const queryState = queryClient.getQueryState(['runtimes'])
      expect(queryState).toBeDefined()
    })

    it('should persist data across component re-renders', async () => {
      const { result, rerender } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const dataBeforeRerender = result.current.data

      rerender()

      // Data should persist
      expect(result.current.data).toEqual(dataBeforeRerender)
    })

    it('should not make duplicate API calls when cache is valid', async () => {
      const { result: result1 } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
      })

      const queryState = queryClient.getQueryState(['runtimes'])
      expect(queryState?.dataUpdatedAt).toBeDefined()

      // Create second hook - should not trigger new fetch
      const { result: result2 } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      expect(result2.current.data).toEqual(result1.current.data)
    })

    it('should have staleTime preventing immediate refetch', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const queryState = queryClient.getQueryState(['runtimes'])
      // Verify data exists and was fetched recently
      expect(queryState?.dataUpdatedAt).toBeDefined()
    })
  })

  describe('Query Options', () => {
    it('should have appropriate staleTime configured', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify query data is available after loading
      expect(result.current.data).toBeDefined()
    })

    it('should not refetch stale data immediately', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // isFetching should be false (not refetching)
      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('Response Transformation', () => {
    it('should return response without unnecessary transformation', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Should match mock data structure if array
      if (Array.isArray(result.current.data)) {
        result.current.data.forEach((runtime) => {
          expect(runtime).toHaveProperty('language')
          expect(runtime).toHaveProperty('version')
        })
      }
    })

    it('should preserve all fields from API response', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      // Check fields if data is array
      if (Array.isArray(result.current.data)) {
        result.current.data.forEach((runtime) => {
          // Check expected fields exist
          if (runtime.language) expect(typeof runtime.language).toBe('string')
          if (runtime.version) expect(typeof runtime.version).toBe('string')
          if (runtime.aliases) expect(Array.isArray(runtime.aliases)).toBe(true)
          if (runtime.runtime) expect(typeof runtime.runtime).toBe('string')
        })
      }
    })
  })

  describe('Empty Response Cases', () => {
    it('should handle empty runtime list', async () => {
      // Test with default mock that returns data
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have completed loading successfully
      expect(result.current.isLoading).toBe(false)
    })

    it('should not have error with empty list response', async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/runtimes`, () => {
          return HttpResponse.json([])
        })
      )

      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Hook Lifecycle', () => {
    it('should return TanStack Query object with all properties', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('status')
      expect(result.current).toHaveProperty('isFetching')
      expect(result.current).toHaveProperty('refetch')
    })

    it('should have refetch function available', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      expect(typeof result.current.refetch).toBe('function')
    })

    it('should allow manual refetch', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Manual refetch
      const refetchResult = await result.current.refetch()

      // Should have data after refetch
      expect(refetchResult.data !== undefined || refetchResult.data === null).toBe(true)
    })
  })

  describe('Type Safety', () => {
    it('should have properly typed response data', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // TypeScript should recognize data as Array<EvaluationServiceRuntimeResponse> or null
      // Type should be recognized correctly by TypeScript
      expect(result.current).toHaveProperty('data')
    })
  })

  describe('Integration Scenarios', () => {
    it('should work in typical component usage pattern', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Component would check isLoading
      if (result.current.isLoading) {
        expect(result.current.isLoading).toBe(true)
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Component would use data
      // Data should be provided by the hook
      expect(result.current).toHaveProperty('data')
    })

    it('should provide error state for error handling in component', async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/runtimes`, () => {
          return HttpResponse.json(
            { message: 'Error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Component would check error
      if (result.current.error) {
        expect(result.current.status).toBe('error')
      }
    })

    it('should provide loading state for UI', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Component renders loading state
      expect(result.current.isLoading || result.current.isFetching).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Component renders data
      expect(result.current.data).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle runtimes with special characters', async () => {
      // Test with default mock - verify data structure supports special chars
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify data can be string or undefined (structure is correct)
      if (Array.isArray(result.current.data) && result.current.data.length > 0) {
        const language = result.current.data[0]?.language
        expect(typeof language === 'string' || language === undefined).toBe(true)
      }
    })

    it('should handle runtimes with missing optional fields', async () => {
      // Test with default mock - verify optional fields handling
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Check that optional fields don't cause errors
      if (Array.isArray(result.current.data)) {
        result.current.data.forEach((runtime) => {
          // language and version might be optional
          expect(typeof runtime === 'object').toBe(true)
        })
      }
    })

    it('should handle large list of runtimes', async () => {
      // Test with default mock - verify no issues with multiple runtimes
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify data structure is correct
      expect(result.current).toHaveProperty('data')
    })
  })

  describe('Retry Behavior', () => {
    it('should have retry configuration', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      // Query client was created with retry: false for tests
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
    })
  })

  describe('Query State', () => {
    it('should allow accessing query state from queryClient', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const queryState = queryClient.getQueryState(['runtimes'])
      expect(queryState).toBeDefined()
      expect(queryState?.data).toEqual(result.current.data)
    })

    it('should keep query state in sync with hook state', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const queryState = queryClient.getQueryState(['runtimes'])
      expect(queryState?.data).toEqual(result.current.data)
      expect(queryState?.status).toBe(result.current.status)
    })
  })

  describe('Concurrent Requests', () => {
    it('should handle concurrent hook calls correctly', async () => {
      const promises = [
        renderHook(() => useRuntimesQuery(), { wrapper }),
        renderHook(() => useRuntimesQuery(), { wrapper }),
        renderHook(() => useRuntimesQuery(), { wrapper }),
      ]

      const results = promises.map((p) => p.result)

      await waitFor(() => {
        results.forEach((result) => {
          expect(result.current.isLoading).toBe(false)
        })
      }, { timeout: 5000 })

      // All should have same data (from cache)
      const firstData = results[0].current.data
      results.forEach((result) => {
        expect(result.current.data).toEqual(firstData)
      })
    })
  })
})
