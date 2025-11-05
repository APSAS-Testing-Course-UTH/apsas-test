/**
 * useSubmissionPolling Hook
 * 
 * Custom hook for real-time submission status polling using TanStack Query
 * 
 * Features:
 * - Polls submission status at specified intervals (default: 5s)
 * - Automatically stops polling when status is EVALUATED or FAILED
 * - Continues polling while status is PENDING
 * - Triggers callback when status changes
 * - Supports enable/disable toggle
 * - Cleanup on unmount
 * 
 * Use Cases:
 * - SubmissionDetail page: Real-time status updates without page refresh
 * - SubmissionsList page: Live status indicators for multiple submissions
 * - Notifications: Trigger toast when evaluation completes
 * 
 * Vietnamese UI: Works with Vietnamese status labels
 */

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { submissionServiceGetSubmissionById } from '@/api/sdk.gen'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

/**
 * Options for useSubmissionPolling hook
 */
export interface UseSubmissionPollingOptions {
  /**
   * ID of the submission to poll
   */
  submissionId: string
  
  /**
   * Whether polling is enabled
   * @default true
   */
  enabled?: boolean
  
  /**
   * Polling interval in milliseconds
   * @default 5000 (5 seconds)
   */
  interval?: number
  
  /**
   * Callback triggered when submission status changes
   * Use this for showing notifications or updating UI
   * 
   * @example
   * ```tsx
   * onStatusChange={(status) => {
   *   if (status === 'EVALUATED') {
   *     showNotification('Đánh giá hoàn tất!', 'success')
   *   }
   * }}
   * ```
   */
  onStatusChange?: (newStatus: SubmissionServiceSubmissionResponse['status']) => void
}

/**
 * Return type for useSubmissionPolling hook
 */
export interface UseSubmissionPollingResult {
  /**
   * Current submission data
   */
  submission: SubmissionServiceSubmissionResponse | undefined
  
  /**
   * Whether polling is currently active
   */
  isPolling: boolean
  
  /**
   * Whether initial data is loading
   */
  isLoading: boolean
  
  /**
   * Error if fetch failed
   */
  error: Error | null
  
  /**
   * Whether data is being fetched (including background refetch)
   */
  isFetching: boolean
}

/**
 * Custom hook for polling submission status
 * 
 * @example
 * ```tsx
 * function SubmissionDetail({ submissionId }: Props) {
 *   const { submission, isPolling } = useSubmissionPolling({
 *     submissionId,
 *     onStatusChange: (status) => {
 *       if (status === 'EVALUATED') {
 *         showNotification('Đánh giá hoàn tất!', 'success')
 *       }
 *     }
 *   })
 * 
 *   return (
 *     <div>
 *       <Badge color={isPolling ? 'blue' : 'gray'}>
 *         {isPolling ? 'Đang đánh giá...' : 'Hoàn tất'}
 *       </Badge>
 *       <p>Điểm: {submission?.score}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSubmissionPolling({
  submissionId,
  enabled = true,
  interval = 5000,
  onStatusChange,
}: UseSubmissionPollingOptions): UseSubmissionPollingResult {
  // Track previous status to detect changes
  const previousStatusRef = useRef<SubmissionServiceSubmissionResponse['status']>(undefined)
  
  // Query submission with polling
  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['submission', submissionId, 'polling'],
    queryFn: async () => {
      const response = await submissionServiceGetSubmissionById({
        path: { id: submissionId },
      })
      return response
    },
    enabled,
    refetchInterval: (query) => {
      const response = query.state.data
      const submission = response?.data
      
      // Stop polling if status is final (EVALUATED or FAILED)
      if (submission?.status === 'EVALUATED' || submission?.status === 'FAILED') {
        return false
      }
      
      // Continue polling for PENDING status
      return interval
    },
    // Keep previous data while refetching to avoid flicker
    placeholderData: (previousData) => previousData,
  })
  
  // Extract submission data from response
  const submission = response?.data
  
  // Trigger callback when status changes
  useEffect(() => {
    if (submission?.status && previousStatusRef.current !== submission.status) {
      // Update ref
      const previousStatus = previousStatusRef.current
      previousStatusRef.current = submission.status
      
      // Call callback (skip first render)
      if (previousStatus !== undefined) {
        onStatusChange?.(submission.status)
      }
    }
  }, [submission?.status, onStatusChange])
  
  // Determine if polling is active
  const isPolling =
    enabled &&
    (submission?.status === 'PENDING' || submission?.status === undefined)
  
  return {
    submission,
    isPolling,
    isLoading,
    error: error as Error | null,
    isFetching,
  }
}
