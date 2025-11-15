/**
 * MSW Handlers for Submission Service
 * 
 * Mocks all submission-related API endpoints for testing and development
 */

import { http, HttpResponse, delay } from 'msw'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import { mockSubmissions } from '../data/submissions'

/**
 * Submission handlers
 */
export const submissionHandlers = [
  /**
   * GET /api/v1/submissions/{id}
   * Get submission by ID
   */
  http.get('/api/v1/submissions/:id', async ({ params }) => {
    const { id } = params
    
    // Simulate network delay
    await delay(100)
    
    // Find submission
    const submission = mockSubmissions.find(
      (s: SubmissionServiceSubmissionResponse) => s.id === id
    )
    
    if (!submission) {
      return HttpResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json<SubmissionServiceSubmissionResponse>(submission)
  }),
  
  /**
   * GET /api/v1/submissions
   * List submissions (with pagination)
   */
  http.get('/api/v1/submissions', async ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    
    await delay(100)
    
    const start = page * size
    const end = start + size
    const items = mockSubmissions.slice(start, end)
    
    return HttpResponse.json({
      content: items,
      totalElements: mockSubmissions.length,
      totalPages: Math.ceil(mockSubmissions.length / size),
      size,
      number: page,
      first: page === 0,
      last: end >= mockSubmissions.length,
      empty: items.length === 0,
    })
  }),
  
  /**
   * POST /api/v1/submissions/{id}/feedback
   * Provide feedback on a submission
   */
  http.post('/api/v1/submissions/:id/feedback', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as { feedback: string }
    
    await delay(200)
    
    // Validate feedback
    if (!body.feedback || body.feedback.length < 10) {
      return HttpResponse.json(
        { message: 'Feedback must be at least 10 characters' },
        { status: 400 }
      )
    }
    
    if (body.feedback.length > 5000) {
      return HttpResponse.json(
        { message: 'Feedback must not exceed 5000 characters' },
        { status: 400 }
      )
    }
    
    // Find and update submission
    const submission = mockSubmissions.find(
      (s: SubmissionServiceSubmissionResponse) => s.id === id
    )
    
    if (!submission) {
      return HttpResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }
    
    // Update submission with feedback
    const updated = {
      ...submission,
      feedback: body.feedback,
      hasFeedback: true,
      feedbackUpdatedAt: new Date().toISOString(),
    }
    
    return HttpResponse.json<SubmissionServiceSubmissionResponse>(updated)
  }),
]
