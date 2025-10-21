import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('POST /api/v1/submissions/:id/feedback', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should provide feedback for submission by authenticated instructor', async () => {
    const feedbackData = {
      feedback: 'Great work! Your solution is correct and well-implemented.',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.id).toBe('sub-003')
    expect(data.feedback).toBe(feedbackData.feedback)
    expect(data.status).toBe('EVALUATED')
    expect(data).toHaveProperty('evaluatedAt')
    expect(data).toHaveProperty('result')
    expect(data).toHaveProperty('score')
    expect(Array.isArray(data.testCaseResults)).toBe(true)
  })

  it('should return 400 for empty feedback', async () => {
    const feedbackData = {
      feedback: '',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toBe('Feedback cannot be empty')
  })

  it('should return 400 for whitespace-only feedback', async () => {
    const feedbackData = {
      feedback: '   ',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toBe('Feedback cannot be empty')
  })

  it('should deny feedback provision for non-instructor users', async () => {
    const feedbackData = {
      feedback: 'Good job!',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(403)
    const error = await response.json()
    expect(error.error).toBe('Forbidden')
    expect(error.message).toBe('Only instructors can provide feedback')
  })

  it('should return 404 for non-existent submission', async () => {
    const feedbackData = {
      feedback: 'Good job!',
    }

    const response = await fetch('/api/v1/submissions/non-existent/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(404)
    const error = await response.json()
    expect(error.error).toBe('Not Found')
    expect(error.message).toBe('Submission not found')
  })

  it('should return 401 for missing authorization', async () => {
    const feedbackData = {
      feedback: 'Good job!',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Missing Authorization header')
  })

  it('should return 401 for invalid token format', async () => {
    const feedbackData = {
      feedback: 'Good job!',
    }

    const response = await fetch('/api/v1/submissions/sub-003/feedback', {
      method: 'POST',
      headers: {
        'Authorization': 'InvalidToken',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Invalid token format')
  })
})
