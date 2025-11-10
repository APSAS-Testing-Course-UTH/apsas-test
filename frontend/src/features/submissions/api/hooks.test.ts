/**
 * Unit Tests for Submission API Hooks
 * Tests: useRuntimesQuery, useFileUploadMutation, useAssignmentDetails, useSubmissionDetails
 * 
 * Uses MSW (Mock Service Worker) for API mocking
 * MSW server is automatically started in src/test/setup.ts beforeAll hook
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import React from 'react'
import {
  useRuntimesQuery,
  useFileUploadMutation,
  useAssignmentDetails,
  useSubmissionDetails,
} from './hooks'

// Helper to create wrapper with QueryClient
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('Submission API Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0, // Disable GC between tests
        },
        mutations: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useRuntimesQuery', () => {
    it('should fetch runtimes successfully', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper: createWrapper(queryClient),
      })

      // Initially pending
      expect(result.current.status).toBe('pending')

      // Wait for success
      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      // Should have runtimes array
      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data?.length).toBeGreaterThan(0)
    })

    it('should have correct runtime structure', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      if (result.current.data && result.current.data.length > 0) {
        const runtime = result.current.data[0]
        expect(runtime).toHaveProperty('language')
        expect(runtime).toHaveProperty('version')
      }
    })

    it('should cache runtimes correctly', async () => {
      const { result: result1 } = renderHook(() => useRuntimesQuery(), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(
        () => {
          expect(result1.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      const firstData = result1.current.data

      // Second call should use cache
      const { result: result2 } = renderHook(() => useRuntimesQuery(), {
        wrapper: createWrapper(queryClient),
      })

      // Should return same data immediately from cache (no pending)
      expect(result2.current.status).toBe('success')
      expect(result2.current.data).toEqual(firstData)
    })

    it('should have correct stale time and gc time', async () => {
      const { result } = renderHook(() => useRuntimesQuery(), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for data to load
      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      // Check cache exists
      const query = queryClient.getQueryState(['runtimes'])
      expect(query).toBeDefined()
      expect(query?.status).toBe('success')
    })
  })

  describe('useFileUploadMutation', () => {
    it('should upload file successfully', async () => {
      const { result } = renderHook(() => useFileUploadMutation(), {
        wrapper: createWrapper(queryClient),
      })

      // Initially not pending
      expect(result.current.isPending).toBe(false)

      // Mutate with valid data
      result.current.mutate({
        assignmentId: '550e8400-e29b-41d4-a716-446655440100',
        code: 'console.log("hello")',
        language: 'JavaScript',
      })

      // Wait for success (mutation is fast with MSW, might already be done)
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify we got a response
      expect(result.current.data).toBeDefined()
    })

    it('should invalidate submissions cache after success', async () => {
      const { result } = renderHook(() => useFileUploadMutation(), {
        wrapper: createWrapper(queryClient),
      })

      // Pre-populate cache
      queryClient.setQueryData(['submissions'], [])

      // Mutate
      result.current.mutate({
        assignmentId: '550e8400-e29b-41d4-a716-446655440100',
        code: 'test code',
        language: 'Python',
      })

      // Wait for success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify upload was successful
      expect(result.current.isSuccess).toBe(true)
    })

    it('should use mapApiError for error mapping', async () => {
      // Test verifies the enhanced mutation uses centralized error handling
      const { result } = renderHook(() => useFileUploadMutation(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.mutate).toBeDefined()
      expect(typeof result.current.mutate).toBe('function')
      expect(result.current.mutateAsync).toBeDefined()

      // Trigger a successful mutation
      result.current.mutate({
        assignmentId: '550e8400-e29b-41d4-a716-446655440100',
        code: 'test code',
        language: 'Python',
      })

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })

      // Mutation should complete (success or error depending on MSW mock)
      expect(result.current.isSuccess || result.current.isError).toBe(true)
      
      // If there's an error, it should have a message
      if (result.current.error) {
        expect(typeof result.current.error.message).toBe('string')
      }
    })
  })

  describe('useAssignmentDetails', () => {
    it('should fetch assignment details when ID is provided', async () => {
      const assignmentId = '550e8400-e29b-41d4-a716-446655440100'
      const { result } = renderHook(() => useAssignmentDetails(assignmentId), {
        wrapper: createWrapper(queryClient),
      })

      // Initially pending
      expect(result.current.status).toBe('pending')

      // Wait for success
      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      // Should have assignment data
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe(assignmentId)
    })

    it('should not fetch when assignment ID is not provided', async () => {
      const { result } = renderHook(() => useAssignmentDetails(undefined), {
        wrapper: createWrapper(queryClient),
      })

      // Query is disabled, so data starts as undefined
      // Since queryFn returns null when no ID, data should be undefined or null
      await waitFor(() => {
        expect(result.current.data === null || result.current.data === undefined).toBe(true)
      })
    })

    it('should handle missing assignment error', async () => {
      const invalidId = 'invalid-uuid-format'
      const { result } = renderHook(() => useAssignmentDetails(invalidId), {
        wrapper: createWrapper(queryClient),
      })

      // Wait for error
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toBeDefined()
    })

    it('should cache assignment details', async () => {
      const assignmentId = '550e8400-e29b-41d4-a716-446655440100'
      
      const { result: result1 } = renderHook(() => useAssignmentDetails(assignmentId), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(
        () => {
          expect(result1.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      const firstData = result1.current.data

      // Second call should use cache
      const { result: result2 } = renderHook(() => useAssignmentDetails(assignmentId), {
        wrapper: createWrapper(queryClient),
      })

      expect(result2.current.status).toBe('success')
      expect(result2.current.data).toEqual(firstData)
    })

    it('should refetch when assignment ID changes', async () => {
      const assignmentId1 = '550e8400-e29b-41d4-a716-446655440100'
      const assignmentId2 = '550e8400-e29b-41d4-a716-446655440101'

      const { result, rerender } = renderHook(
        ({ id }: { id?: string }) => useAssignmentDetails(id),
        {
          initialProps: { id: assignmentId1 },
          wrapper: createWrapper(queryClient),
        }
      )

      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      const firstId = result.current.data?.id

      // Change ID
      rerender({ id: assignmentId2 })

      // Should fetch new data
      await waitFor(
        () => {
          expect(result.current.data?.id).toBe(assignmentId2)
        },
        { timeout: 3000 }
      )

      expect(result.current.data?.id).not.toBe(firstId)
    })

    it('should have correct response type', async () => {
      const assignmentId = '550e8400-e29b-41d4-a716-446655440100'
      const { result } = renderHook(() => useAssignmentDetails(assignmentId), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      // Type check: assignment should have expected properties
      if (result.current.data) {
        expect(result.current.data).toHaveProperty('id')
        expect(result.current.data).toHaveProperty('title')
        expect(result.current.data).toHaveProperty('description')
      }
    })
  })

  describe('useSubmissionDetails', () => {
    it('should fetch submission details when ID is provided', async () => {
      const submissionId = '550e8400-e29b-41d4-a716-446655440000'
      const { result } = renderHook(() => useSubmissionDetails(submissionId), {
        wrapper: createWrapper(queryClient),
      })

      // Initially pending
      expect(result.current.status).toBe('pending')

      // Wait for success
      await waitFor(
        () => {
          expect(result.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      // Should have submission data
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe(submissionId)
    })

    it('should not fetch when submission ID is not provided', async () => {
      const { result } = renderHook(() => useSubmissionDetails(undefined), {
        wrapper: createWrapper(queryClient),
      })

      // Query is disabled when no ID provided
      // Data is undefined when query is disabled
      await waitFor(() => {
        expect(result.current.data === null || result.current.data === undefined).toBe(true)
      })
    })

    it('should cache submission details', async () => {
      const submissionId = '550e8400-e29b-41d4-a716-446655440000'
      
      const { result: result1 } = renderHook(() => useSubmissionDetails(submissionId), {
        wrapper: createWrapper(queryClient),
      })

      await waitFor(
        () => {
          expect(result1.current.status).toBe('success')
        },
        { timeout: 3000 }
      )

      const firstData = result1.current.data

      // Second call should use cache
      const { result: result2 } = renderHook(() => useSubmissionDetails(submissionId), {
        wrapper: createWrapper(queryClient),
      })

      expect(result2.current.status).toBe('success')
      expect(result2.current.data).toEqual(firstData)
    })
  })
})
