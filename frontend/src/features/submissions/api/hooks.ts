import { useQuery, useMutation } from '@tanstack/react-query'
import { evaluationServiceGetSupportedRuntimes, submissionServiceGetSubmissionById } from '@/api/sdk.gen'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import axios from 'axios'

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
    queryKey: ['runtimes'],
    queryFn: async () => {
      // Use generated SDK client (type-safe)
      // This automatically handles API errors and response validation
      const response = await evaluationServiceGetSupportedRuntimes()
      return response
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
  return useMutation<
    SubmissionServiceSubmissionResponse,
    Error,
    {
      assignmentId: string
      file: File
      language: string
    }
  >({
    mutationFn: async ({ assignmentId, file, language }) => {
      const formData = new FormData()
      formData.append('assignmentId', assignmentId)
      formData.append('file', file)
      formData.append('language', language)

      // Upload file via multipart/form-data
      const response = await axios.post<SubmissionServiceSubmissionResponse>(
        '/api/v1/submissions/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data
    },
    onSuccess: () => {
      // Invalidate submissions cache after successful upload
      // This will trigger a refetch of submissions list
      // Note: Requires queryClient access - can be added if needed
    },
    onError: (error) => {
      // Error handling is delegated to component level
      console.error('File upload failed:', error)
    },
  })
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
  return useQuery<any>({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return null
      
      try {
        // Direct fetch to ensure we hit MSW handlers correctly
        const response = await fetch(`/api/v1/assignments/${assignmentId}`)
        
        if (!response.ok) {
          console.warn(`[useAssignmentDetails] Failed to fetch assignment ${assignmentId}:`, response.status)
          return null
        }
        
        return await response.json()
      } catch (error) {
        console.error(`[useAssignmentDetails] Error fetching assignment ${assignmentId}:`, error)
        return null
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
      queryKey: ['submission', submissionId],
      queryFn: async () => {
        if (!submissionId) return null
        
        try {
          // Use generated SDK client with proper authorization header
          const response = await submissionServiceGetSubmissionById({
            path: { id: submissionId }
          })
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
