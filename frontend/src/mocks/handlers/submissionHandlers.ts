import { http, HttpResponse } from 'msw'
import { withAuth } from '../middleware/withAuth'
import { UserRole } from '../middleware/withAuth'
import { errorResponses } from '../middleware/errorHandler'
import { submissionUrl, MSW_BASE_URL } from '../config'

console.log('[Submission Handlers] Using base URL:', MSW_BASE_URL)

// Define submission-related types based on OpenAPI spec
export type SubmissionStatus = 'PENDING' | 'EVALUATED' | 'FAILED'
export type SubmissionResult = 'PASSED' | 'FAILED' | 'PARTIAL'

export type TestCaseResultResponse = {
  order: number
  description: string
  hidden: boolean
  weight: number
  input: string
  output: string
  timeout: number
  memoryLimit: number
  passed: boolean
  actualOutput?: string
  errorMessage?: string
  executionTime: number
  memoryUsed: number
}

export type SubmissionResponse = {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: string
  status: SubmissionStatus
  code: string
  language: string
  result?: SubmissionResult
  score?: number
  testCaseResults?: TestCaseResultResponse[]
  evaluatedAt?: string
  feedback?: string
}

export type CreateSubmissionRequest = {
  assignmentId: string
  code: string
  language: string
}

export type SubmissionFeedbackRequest = {
  feedback: string
}

export type PageResponseSubmissionResponse = {
  content: SubmissionResponse[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

// Mock submissions database - use generated mock data with valid UUIDs
// Import from centralized mock data registry
import { MOCK_DATA_REGISTRY } from '../factory/mockDataRegistry'

// Convert array to Record for backwards compatibility
const mockSubmissions: Record<string, SubmissionResponse> = {}
MOCK_DATA_REGISTRY.submissions.forEach((sub) => {
  if (sub.id) {
    mockSubmissions[sub.id] = {
      ...sub,
      submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : new Date().toISOString(),
      evaluatedAt: sub.evaluatedAt ? sub.evaluatedAt.toISOString() : undefined,
    } as SubmissionResponse
  }
})

export const submissionHandlers = [
  /**
   * GET /api/v1/submissions
   * List all submissions with filters and pagination
   * Students see only their own, instructors can filter by assignment and student
   */
  http.get(`${submissionUrl('submissions')}`,
    withAuth(({ request }: { request: Request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 0
      const size = Number(url.searchParams.get('size')) || 10
      const assignmentId = url.searchParams.get('assignmentId')
      const studentId = url.searchParams.get('studentId')
      const status = url.searchParams.get('status') as SubmissionStatus | null

      // Get user role from token (simplified for mock)
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('admin') ? UserRole.ADMIN :
                      token?.includes('instructor') ? UserRole.INSTRUCTOR :
                      token?.includes('student') ? UserRole.STUDENT : UserRole.STUDENT

      // Phase 10: Consolidated data - submissions can also be extracted from consolidated assignments
      // For now, using flat submission array for backward compatibility
      let filtered = Object.values(mockSubmissions)

      // Apply filters
      if (assignmentId) {
        filtered = filtered.filter(s => s.assignmentId === assignmentId)
      }

      if (studentId) {
        // Only instructors and admins can filter by student
        if (userRole === UserRole.INSTRUCTOR || userRole === UserRole.ADMIN) {
          filtered = filtered.filter(s => s.studentId === studentId)
        } else {
          return errorResponses.forbidden('Access denied')
        }
      }

      if (status) {
        filtered = filtered.filter(s => s.status === status)
      }

      // Students can only see their own submissions
      if (userRole === UserRole.STUDENT) {
        // In a real app, we'd get student ID from token
        filtered = filtered.filter(s => s.studentId === 'student-001')
      }

      const response: PageResponseSubmissionResponse = {
        content: filtered.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        first: page === 0,
        last: page >= Math.ceil(filtered.length / size) - 1,
        hasNext: page < Math.ceil(filtered.length / size) - 1,
        hasPrevious: page > 0,
      }

      return HttpResponse.json(response, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/submissions
   * Create new submission (Students only)
   * SDK calls /api/v1/submissions (not /api/v1/submission/submissions)
   */
  http.post(`${MSW_BASE_URL}/api/v1/submissions`,
    withAuth(async ({ request }: { request: Request }) => {
      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('admin') ? UserRole.ADMIN :
                      token?.includes('instructor') ? UserRole.INSTRUCTOR :
                      token?.includes('student') ? UserRole.STUDENT : UserRole.STUDENT

      // Only students can create submissions
      if (userRole !== UserRole.STUDENT) {
        return errorResponses.forbidden('Only students can create submissions')
      }

      const body: CreateSubmissionRequest = await request.json()

      // Validate required fields
      if (!body.assignmentId || !body.code || !body.language) {
        return errorResponses.badRequest('Missing required fields: assignmentId, code, language')
      }

      const newSubmission: SubmissionResponse = {
        id: crypto.randomUUID(),
        assignmentId: body.assignmentId,
        studentId: 'student-001', // In real app, get from token
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        code: body.code,
        language: body.language,
        // No result/score yet since it's pending evaluation
      }

      // Store in mock database
      mockSubmissions[newSubmission.id] = newSubmission

      return HttpResponse.json(newSubmission, { status: 200 })
    })
  ),

  /**
   * GET /api/v1/submissions/{id}
   * Get submission by ID
   * Students can only view their own, instructors can view all
   */
  http.get('**/api/v1/submissions/:id',
    withAuth(({ params, request }: { params: { id: string }, request: Request }) => {
      const { id } = params
      const submission = mockSubmissions[id]

      if (!submission) {
        return errorResponses.notFound('Submission not found')
      }

      const token = request.headers.get('Authorization')?.split(' ')[1]
      const userRole = token?.includes('admin') ? UserRole.ADMIN :
                      token?.includes('instructor') ? UserRole.INSTRUCTOR :
                      token?.includes('student') ? UserRole.STUDENT : UserRole.STUDENT

      // Students can only view their own submissions
      if (userRole === UserRole.STUDENT && submission.studentId !== 'student-001') {
        return errorResponses.forbidden('Access denied')
      }

      return HttpResponse.json(submission, { status: 200 })
    })
  ),

  /**
   * POST /api/v1/submissions/{id}/feedback
   * Provide feedback for submission (Instructors only)
   */
  http.post('**/api/v1/submissions/:id/feedback',
    withAuth(async ({ request, params, user }: { request: Request, params: { id: string }, user: MockUser }) => {
      const { id } = params

      // Only instructors can provide feedback
      if (user.role !== UserRole.INSTRUCTOR) {
        return errorResponses.forbidden('Only instructors can provide feedback')
      }

      const submission = mockSubmissions[id]

      if (!submission) {
        return errorResponses.notFound('Submission not found')
      }

      const body: SubmissionFeedbackRequest = await request.json()

      if (!body.feedback || body.feedback.trim().length === 0) {
        return errorResponses.badRequest('Feedback cannot be empty')
      }

      // Update submission with feedback
      const updatedSubmission: SubmissionResponse = {
        ...submission,
        feedback: body.feedback,
        status: 'EVALUATED',
        evaluatedAt: new Date().toISOString(),
        // Simulate evaluation result
        result: Math.random() > 0.3 ? 'PASSED' : 'FAILED',
        score: Math.floor(Math.random() * 101),
        testCaseResults: submission.testCaseResults || [
          {
            order: 1,
            description: 'Automated test case',
            hidden: false,
            weight: 1.0,
            input: 'test input',
            output: 'expected output',
            timeout: 5000,
            memoryLimit: 128,
            passed: Math.random() > 0.3,
            actualOutput: Math.random() > 0.3 ? 'expected output' : 'wrong output',
            executionTime: Math.random() * 100,
            memoryUsed: Math.random() * 50,
          },
        ],
      }

      mockSubmissions[id] = updatedSubmission

      return HttpResponse.json(updatedSubmission, { status: 200 })
    })
  ),
]
