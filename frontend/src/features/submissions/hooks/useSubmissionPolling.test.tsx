import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubmissionPolling } from './useSubmissionPolling'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

vi.mock('@/api/sdk.gen', () => ({
  submissionServiceGetSubmissionById: vi.fn(),
}))

import { submissionServiceGetSubmissionById } from '@/api/sdk.gen'

const mockPendingSubmission: SubmissionServiceSubmissionResponse = {
  id: 'sub-123',
  status: 'PENDING' as const,
  assignmentId: 'assign-1',
  studentId: 'student-1',
  submittedAt: new Date('2025-01-15T10:00:00Z'),
  evaluatedAt: undefined,
  score: undefined,
  feedback: undefined,
  testCaseResults: undefined,
}

const mockEvaluatedSubmission: SubmissionServiceSubmissionResponse = {
  ...mockPendingSubmission,
  status: 'EVALUATED' as const,
  evaluatedAt: new Date('2025-01-15T10:05:00Z'),
  score: 85,
  feedback: 'Tốt lắm!',
  testCaseResults: [
    { order: 1, passed: true },
    { order: 2, passed: true },
    { order: 3, passed: false },
  ],
}

const mockFailedSubmission: SubmissionServiceSubmissionResponse = {
  ...mockPendingSubmission,
  status: 'FAILED' as const,
  evaluatedAt: new Date('2025-01-15T10:05:00Z'),
  score: 0,
  feedback: 'Có lỗi khi chấm bài',
  testCaseResults: undefined,
}

describe('useSubmissionPolling', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('Basic Polling', () => {
    it('should fetch submission data initially', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockPendingSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () => useSubmissionPolling({ submissionId: 'sub-123' }),
        { wrapper }
      )

      expect(result.current.submission).toBeUndefined()

      await waitFor(() => {
        expect(result.current.submission).toBeDefined()
      })

      expect(result.current.submission?.status).toBe('PENDING')
      expect(vi.mocked(submissionServiceGetSubmissionById)).toHaveBeenCalledWith({
        path: { id: 'sub-123' },
      })
    })

    it('should poll submission when status is PENDING', async () => {
      let callCount = 0

      vi.mocked(submissionServiceGetSubmissionById).mockImplementation(
        async () => {
          callCount++
          const data =
            callCount === 1 ? mockPendingSubmission : mockEvaluatedSubmission
          return {
            data,
            error: undefined,
            request: {} as Request,
            response: {} as Response,
          } as any
        }
      )

      const { result } = renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 100, // Fast polling for test
          }),
        { wrapper }
      )

      // Wait for first fetch (PENDING)
      await waitFor(() => {
        expect(result.current.submission?.status).toBe('PENDING')
      }, { timeout: 3000 })

      // Wait for polling to trigger second fetch (EVALUATED)
      await waitFor(() => {
        expect(result.current.submission?.status).toBe('EVALUATED')
      }, { timeout: 3000 })

      expect(callCount).toBeGreaterThanOrEqual(2)
    }, 10000)

    it('should stop polling when status is EVALUATED', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockEvaluatedSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 100,
          }),
        { wrapper }
      )

      // Wait for first fetch
      await waitFor(() => {
        expect(result.current.submission?.status).toBe('EVALUATED')
      }, { timeout: 3000 })

      const firstCallCount = vi.mocked(submissionServiceGetSubmissionById).mock
        .calls.length

      // Wait 500ms - should NOT trigger more polls since status is EVALUATED
      await new Promise(resolve => setTimeout(resolve, 500))

      expect(
        vi.mocked(submissionServiceGetSubmissionById).mock.calls.length
      ).toBe(firstCallCount)
    }, 10000)

    it('should stop polling when status is FAILED', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockFailedSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 100,
          }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.submission?.status).toBe('FAILED')
      }, { timeout: 3000 })

      const firstCallCount = vi.mocked(submissionServiceGetSubmissionById).mock
        .calls.length

      await new Promise(resolve => setTimeout(resolve, 500))

      expect(
        vi.mocked(submissionServiceGetSubmissionById).mock.calls.length
      ).toBe(firstCallCount)
    }, 10000)
  })

  describe('Status Change Callbacks', () => {
    it('should call onStatusChange when status changes', async () => {
      let callCount = 0

      vi.mocked(submissionServiceGetSubmissionById).mockImplementation(
        async () => {
          callCount++
          const data =
            callCount === 1 ? mockPendingSubmission : mockEvaluatedSubmission
          return {
            data,
            error: undefined,
            request: {} as Request,
            response: {} as Response,
          } as any
        }
      )

      const onStatusChange = vi.fn()

      renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 100,
            onStatusChange,
          }),
        { wrapper }
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(callCount).toBe(1)
      }, { timeout: 3000 })

      // Wait for status change
      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('EVALUATED')
      }, { timeout: 3000 })
    }, 10000)
  })

  describe('Enable/Disable Polling', () => {
    it('should not poll when enabled is false', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockPendingSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            enabled: false,
          }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.submission).toBeUndefined()
      })

      expect(
        vi.mocked(submissionServiceGetSubmissionById)
      ).not.toHaveBeenCalled()
    })

    it('should resume polling when enabled changes to true', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockPendingSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            enabled,
          }),
        {
          wrapper,
          initialProps: { enabled: false },
        }
      )

      await waitFor(() => {
        expect(result.current.submission).toBeUndefined()
      })

      rerender({ enabled: true })

      await waitFor(() => {
        expect(result.current.submission).toBeDefined()
      })

      expect(result.current.submission?.status).toBe('PENDING')
    })
  })

  describe('Custom Interval', () => {
    it('should use custom polling interval', async () => {
      let callCount = 0

      vi.mocked(submissionServiceGetSubmissionById).mockImplementation(
        async () => {
          callCount++
          return {
            data: mockPendingSubmission,
            error: undefined,
            request: {} as Request,
            response: {} as Response,
          } as any
        }
      )

      renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 200, // 200ms interval
          }),
        { wrapper }
      )

      // Wait for first fetch
      await waitFor(() => {
        expect(callCount).toBe(1)
      }, { timeout: 3000 })

      // Wait 100ms (should NOT trigger - interval is 200ms)
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(callCount).toBe(1)

      // Wait another 150ms (total 250ms, should trigger)
      await new Promise(resolve => setTimeout(resolve, 150))
      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(2)
      }, { timeout: 3000 })
    }, 10000)
  })

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(
        () => useSubmissionPolling({ submissionId: 'sub-123' }),
        { wrapper }
      )

      // Wait for error state
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      }, { timeout: 3000 })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.submission).toBeUndefined()
    }, 10000)
  })

  describe('Cleanup', () => {
    it('should stop polling on unmount', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockPendingSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { unmount } = renderHook(
        () =>
          useSubmissionPolling({
            submissionId: 'sub-123',
            interval: 100,
          }),
        { wrapper }
      )

      // Wait for first fetch
      await waitFor(() => {
        expect(
          vi.mocked(submissionServiceGetSubmissionById)
        ).toHaveBeenCalledTimes(1)
      }, { timeout: 3000 })

      unmount()

      const callCountAfterUnmount = vi.mocked(
        submissionServiceGetSubmissionById
      ).mock.calls.length

      // Wait 500ms after unmount
      await new Promise(resolve => setTimeout(resolve, 500))

      // Should NOT trigger more calls after unmount
      expect(
        vi.mocked(submissionServiceGetSubmissionById).mock.calls.length
      ).toBe(callCountAfterUnmount)
    }, 10000)
  })

  describe('Return Values', () => {
    it('should return correct query states', async () => {
      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockEvaluatedSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () => useSubmissionPolling({ submissionId: 'sub-123' }),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.submission).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.submission?.status).toBe('EVALUATED')
    })
  })

  describe('Vietnamese UI Integration', () => {
    it('should work with Vietnamese status values', async () => {
      const mockVietnameseSubmission: SubmissionServiceSubmissionResponse = {
        ...mockPendingSubmission,
        feedback: 'Bài làm tốt! Tiếp tục phát huy.',
      }

      vi.mocked(submissionServiceGetSubmissionById).mockResolvedValue({
        data: mockVietnameseSubmission,
        error: undefined,
        request: {} as Request,
        response: {} as Response,
      } as any)

      const { result } = renderHook(
        () => useSubmissionPolling({ submissionId: 'sub-123' }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.submission).toBeDefined()
      })

      expect(result.current.submission?.feedback).toBe(
        'Bài làm tốt! Tiếp tục phát huy.'
      )
    })
  })
})
