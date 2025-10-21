import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('GET /api/v1/submissions/:id', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should return submission for authenticated student viewing their own', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/sub-001`, {
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.id).toBe('sub-001')
    expect(data.assignmentId).toBe('assign-001')
    expect(data.studentId).toBe('student-001')
    expect(data.status).toBe('EVALUATED')
    expect(data.result).toBe('PASSED')
    expect(data).toHaveProperty('code')
    expect(data).toHaveProperty('language')
    expect(data).toHaveProperty('submittedAt')
    expect(data).toHaveProperty('evaluatedAt')
    expect(data).toHaveProperty('feedback')
    expect(Array.isArray(data.testCaseResults)).toBe(true)
  })

  it('should return submission for authenticated instructor viewing any', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/sub-002`, {
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.id).toBe('sub-002')
    expect(data.studentId).toBe('student-002')
    expect(data.status).toBe('EVALUATED')
    expect(data.result).toBe('FAILED')
  })

  it('should deny student access to other student submissions', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/sub-002`, {
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(403)
    const error = await response.json()
    expect(error.error).toBe('Forbidden')
    expect(error.message).toBe('Access denied')
  })

  it('should return 404 for non-existent submission', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/non-existent`, {
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(404)
    const error = await response.json()
    expect(error.error).toBe('Not Found')
    expect(error.message).toBe('Submission not found')
  })

  it('should return 401 for missing authorization', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/sub-001`)

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Missing Authorization header')
  })

  it('should return 401 for invalid token format', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions/sub-001`, {
      headers: {
        'Authorization': 'InvalidToken',
      },
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Invalid token format')
  })
})
