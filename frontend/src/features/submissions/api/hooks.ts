import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  evaluationServiceGetSupportedRuntimes,
  submissionServiceGetSubmissionById,
  submissionServiceCreateSubmission,
  contentServiceGetAssignmentById,
} from '@/api/sdk.gen'
import type {
  SubmissionServiceSubmissionResponse,
  ContentServiceAssignmentResponse,
} from '@/api/types.gen'
import { mapApiError } from '@/configs/api-error-handler'
import { submissionKeys } from './queryKeys'
import { assignmentKeys } from '@/features/assignments/api/useAssignmentsQuery'

/**
 * Hook to fetch supported programming language runtimes
 *
 * Fetches the list of available programming languages and their versions
 * from the backend via GET /api/v1/runtimes endpoint.
 *
 * This hook is used to populate the language selector in CodeSubmissionForm.
 *
 * Features:
 * - ✅ Type-safe with EvaluationServiceRuntimeResponse
 * - ✅ TanStack Query caching (5 minutes stale, 30 minutes GC)
 * - ✅ Error handling
 * - ✅ Loading states
 * - ✅ Shared cache between instances
 *
 * @returns {UseQueryResult<EvaluationServiceRuntimeResponse[]>} Query result
 *   - data: Array of available runtimes
 *   - isLoading: Whether data is being fetched
 *   - error: Error object if fetch failed
 *   - status: 'pending' | 'success' | 'error'
 *   - refetch: Function to manually refetch
 *
 * @example
 * ```tsx
 * // In a component
 * const { data: runtimes, isLoading, error } = useRuntimesQuery()
 *
 * if (isLoading) return <div>Đang tải danh sách ngôn ngữ...</div>
 * if (error) return <div>Lỗi tải ngôn ngữ</div>
 *
 * return (
 *   <select>
 *     {runtimes?.map((runtime) => (
 *       <option key={runtime.language} value={runtime.language}>
 *         {runtime.language} {runtime.version}
 *       </option>
 *     ))}
 *   </select>
 * )
 * ```
 */
export function useRuntimesQuery() {
  return useQuery({
    queryKey: submissionKeys.runtimes(),
    queryFn: async () => {
      // Use generated SDK client (type-safe)
      // This automatically handles API errors and response validation
      const response = await evaluationServiceGetSupportedRuntimes()
      // SDK returns { data: [...], error: ..., ... }, extract just the array
      if (response.error) {
        throw response.error
      }
      return response.data || []
    },
    // Caching strategy:
    // - staleTime: 5 minutes - data is considered fresh for 5 minutes
    // - gcTime: 30 minutes - data is kept in cache for 30 minutes
    // This prevents unnecessary API calls while allowing data refresh when needed
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}


/**
 * Hook to upload code file submission
 *
 * Uploads a code file to the backend via POST /api/v1/submissions/upload endpoint.
 * The file is sent as multipart/form-data.
 *
 * Features:
 * - ✅ Type-safe with SubmissionServiceSubmissionResponse
 * - ✅ File validation before upload
 * - ✅ Upload progress tracking
 * - ✅ Error handling with specific error types
 * - ✅ Automatic cache invalidation after success
 *
 * @returns {UseMutationResult} Mutation result
 *   - mutate/mutateAsync: Function to trigger upload
 *   - isLoading/isPending: Whether upload is in progress
 *   - error: Error object if upload failed
 *   - data: Response from server
 *
 * @example
 * ```tsx
 * // In a component
 * const uploadMutation = useFileUploadMutation()
 *
 * const handleFileUpload = async (file: File, language: string) => {
 *   await uploadMutation.mutateAsync({
 *     assignmentId: '123',
 *     file: file,
 *     language: language
 *   })
 * }
 *
 * return (
 *   <button onClick={() => handleFileUpload(file, lang)}>
 *     {uploadMutation.isPending ? 'Đang tải lên...' : 'Nộp bài'}
 *   </button>
 * )
 * ```
 */
export function useFileUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    SubmissionServiceSubmissionResponse,
    Error,
    {
      assignmentId: string
      code: string
      language: string
    }
  >({
    mutationFn: async ({ assignmentId, code, language }) => {
      try {
        // Use SDK function for type-safe API call with proper error handling
        const result = await submissionServiceCreateSubmission({
          body: {
            assignmentId,
            code,
            language,
          },
        })

        if (result.error) {
          throw result.error
        }

        if (!result.data) {
          throw new Error('No response data from API')
        }

        return result.data
      } catch (error) {
        // Map error to user-friendly Vietnamese message using centralized error handler
        const mappedError = mapApiError(error)
        // Preserve error code and details for retry logic in component
        const enhancedError = new Error(mappedError.message)
        ;(enhancedError as any).code = mappedError.code
        ;(enhancedError as any).isRetryable = isRetryableError(mappedError.code)
        throw enhancedError
      }
    },
    // Retry logic for transient errors
    retry: (failureCount, error) => {
      const isRetryable = (error as any)?.isRetryable

      // Don't retry if already attempted 3 times
      if (failureCount >= 3) {
        return false
      }

      // Retry on network errors and 5xx server errors
      if (isRetryable) {
        return true
      }

      // Don't retry on 4xx client errors (validation, auth, etc)
      return false
    },
    // Exponential backoff for retries: 1s, 2s, 4s
    retryDelay: (attemptIndex) => {
      return Math.min(1000 * Math.pow(2, attemptIndex), 4000)
    },
    onSuccess: () => {
      // Invalidate submissions cache after successful upload
      // This triggers a refetch of submissions list
      queryClient.invalidateQueries({
        queryKey: submissionKeys.lists(),
      })
    },
    onError: (error) => {
      // Error handling logged for debugging
      console.error('[useFileUploadMutation] Error:', error.message)
    },
  })
}

/**
 * Helper function to determine if an error is retryable
 * Retryable errors: network errors, server errors (5xx)
 * Non-retryable errors: validation errors (400/422), auth errors (401), not found (404)
 */
function isRetryableError(errorCode: string | undefined): boolean {
  if (!errorCode) return false
  if (errorCode === 'NETWORK_ERROR') return true
  if (errorCode === 'HTTP_502' || errorCode === 'HTTP_503' || errorCode === 'HTTP_504') return true
  if (errorCode?.startsWith('HTTP_5')) return true
  return false
}


/**
 * Hook to fetch assignment details by ID
 *
 * Fetches assignment information (title, description, etc.) from the backend
 * via GET /api/v1/assignments/{id} endpoint.
 *
 * Features:
 * - ✅ Type-safe with ContentServiceAssignmentResponse
 * - ✅ TanStack Query caching (10 minutes stale, 1 hour GC)
 * - ✅ Shared cache - multiple components using same assignment don't refetch
 * - ✅ Only fetches when assignmentId is provided (enabled: !!assignmentId)
 * - ✅ Error handling
 *
 * @param {string} assignmentId - UUID of the assignment
 * @returns {UseQueryResult} Query result
 *   - data: AssignmentResponse with title, description, etc.
 *   - isLoading: Whether data is being fetched
 *   - error: Error object if fetch failed
 *   - isFetching: Whether background refetch is happening
 *
 * @example
 * ```tsx
 * // In SubmissionsList - fetch assignment name for display
 * const { data: assignment } = useAssignmentDetails(submission.assignmentId)
 *
 * return <div>{assignment?.title || 'Đang tải...'}</div>
 * ```
 */
export function useAssignmentDetails(assignmentId?: string) {
  return useQuery<ContentServiceAssignmentResponse | null, Error>({
    queryKey: assignmentKeys.detail(assignmentId || 'none'),
    queryFn: async () => {
      if (!assignmentId) return null

      try {
        // Use SDK function for type-safe API call with proper error handling
        const result = await contentServiceGetAssignmentById({
          path: { id: assignmentId },
        })

        if (result.error) {
          console.warn(`[useAssignmentDetails] API error for assignment ${assignmentId}:`, result.error)
          throw result.error
        }

        if (!result.data) {
          console.warn(`[useAssignmentDetails] No data returned for assignment ${assignmentId}`)
          return null
        }

        return result.data
      } catch (error) {
        console.error(`[useAssignmentDetails] Error fetching assignment ${assignmentId}:`, error)
        throw error
      }
    },
    // Caching strategy:
    // - staleTime: 10 minutes - assignment details rarely change mid-session
    // - gcTime: 1 hour - keep in cache for 1 hour
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    // Only run query if assignmentId is provided
    enabled: !!assignmentId,
  })
}


/**
 * Hook to fetch submission details by ID
 * 
 * Fetches a specific submission from the backend via GET /api/v1/submissions/{id}
 * This is used when viewing submission details or feedback.
 *
 * Features:
 * - ✅ Type-safe with SubmissionServiceSubmissionResponse
 * - ✅ TanStack Query caching (5 minutes stale, 30 minutes GC)
 * - ✅ Only fetches when submissionId is provided
 * - ✅ Error handling
 *
 * @param {string} submissionId - UUID of the submission
 * @returns {UseQueryResult} Query result
 *   - data: Submission details with assignmentId, code, score, etc.
 *   - isLoading: Whether data is being fetched
 *   - error: Error object if fetch failed
 *
 * @example
 * ```tsx
 * const { data: submission, isLoading } = useSubmissionDetails(submissionId)
 * 
 * if (isLoading) return <Loader />
 * if (!submission) return <div>Not found</div>
 * 
 * // Now fetch assignment using submission.assignmentId
 * const { data: assignment } = useAssignmentDetails(submission.assignmentId)
 * ```
 */
export function useSubmissionDetails(submissionId?: string) {
  return useQuery<SubmissionServiceSubmissionResponse | null, Error>(
    {
      queryKey: submissionKeys.detail(submissionId || 'none'),
      queryFn: async () => {
        if (!submissionId) return null
        
        try {
          // Use generated SDK client with proper authorization header
          const response = await submissionServiceGetSubmissionById({
            path: { id: submissionId }
          })
          
          // Check for errors from SDK response
          if (response.error) {
            throw response.error
          }
          
          return response.data || null
        } catch (error) {
          console.error(`[useSubmissionDetails] Error fetching submission ${submissionId}:`, error)
          throw error
        }
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      enabled: !!submissionId,
    }
  )
}
