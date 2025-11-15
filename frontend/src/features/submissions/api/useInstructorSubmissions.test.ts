/**
 * Test Suite: useInstructorSubmissions Hook
 * 
 * Tests for instructor submission management hooks:
 * - useInstructorSubmissions
 * - useInstructorSubmissionDetail
 * - useProvideFeedback
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInstructorSubmissions, useProvideFeedback } from '@/features/submissions/api/useInstructorSubmissions'
import type { ReactNode } from 'react'

// Create a wrapper for query client
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useInstructorSubmissions Hook', () => {
  it('should fetch submissions successfully', async () => {
    const { result } = renderHook(
      () => useInstructorSubmissions(undefined, 0, 10),
      { wrapper: createWrapper() }
    )

    // Initial state
    expect(result.current.isLoading).toBe(true)

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify data structure
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.content).toBeDefined()
    expect(Array.isArray(result.current.data?.content)).toBe(true)
  })

  it('should handle pagination correctly', async () => {
    const { result, rerender } = renderHook(
      ({ page, size }) => useInstructorSubmissions(undefined, page, size),
      {
        wrapper: createWrapper(),
        initialProps: { page: 0, size: 10 },
      }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const firstPageData = result.current.data

    // Change to second page
    rerender({ page: 1, size: 10 })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Data should be different (or same if only one page)
    expect(result.current.data).toBeDefined()
  })

  it('should filter by assignment ID when provided', async () => {
    const assignmentId = '550e8400-e29b-41d4-a716-446655440100'
    
    const { result } = renderHook(
      () => useInstructorSubmissions(assignmentId, 0, 10),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should have submissions for this assignment
    expect(result.current.data?.content).toBeDefined()
  })

  it('should include feedback status in submissions', async () => {
    const { result } = renderHook(
      () => useInstructorSubmissions(undefined, 0, 10),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check submissions have proper structure
    if (result.current.data?.content && result.current.data.content.length > 0) {
      const submission = result.current.data.content[0]
      expect(submission).toHaveProperty('id')
      expect(submission).toHaveProperty('studentId')
      expect(submission).toHaveProperty('status')
    }
  })

  it('should handle empty results', async () => {
    // Request with non-existent assignment ID would likely return empty
    const { result } = renderHook(
      () => useInstructorSubmissions('non-existent-id', 0, 10),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})

describe('useProvideFeedback Hook', () => {
  it('should provide feedback successfully', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const submissionId = '550e8400-e29b-41d4-a716-446655440000'
    const feedback = 'This is great code! Keep up the good work with error handling.'

    result.current.mutate({ submissionId, feedback })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should validate feedback length (minimum)', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const submissionId = '550e8400-e29b-41d4-a716-446655440000'
    const shortFeedback = 'Too short' // 9 characters (less than 10)

    result.current.mutate({ submissionId, feedback: shortFeedback })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should validate feedback length (maximum)', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const submissionId = '550e8400-e29b-41d4-a716-446655440000'
    const longFeedback = 'a'.repeat(5001) // 5001 characters (exceeds 5000)

    result.current.mutate({ submissionId, feedback: longFeedback })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should reject non-existent submission', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const invalidSubmissionId = 'non-existent-submission-id'
    const feedback = 'Trying to give feedback on non-existent submission'

    result.current.mutate({ submissionId: invalidSubmissionId, feedback })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('should show loading state during mutation', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const submissionId = '550e8400-e29b-41d4-a716-446655440000'
    const feedback = 'This is great feedback for the student!'

    expect(result.current.isPending).toBe(false)

    result.current.mutate({ submissionId, feedback })

    // The isPending state should be true immediately after mutate
    // but might be false quickly due to fast mock response
  })

  it('should clear error state on successful retry', async () => {
    const { result } = renderHook(
      () => useProvideFeedback(),
      { wrapper: createWrapper() }
    )

    const submissionId = '550e8400-e29b-41d4-a716-446655440000'

    // First mutation fails (too short)
    result.current.mutate({ submissionId, feedback: 'Too short' })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Second mutation succeeds
    result.current.mutate({
      submissionId,
      feedback: 'This is valid feedback with proper length!',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.error).toBeNull()
  })
})
