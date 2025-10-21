import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('GET /api/v1/submissions', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should return submissions for authenticated student', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('content')
    expect(data).toHaveProperty('pageNumber', 0)
    expect(data).toHaveProperty('pageSize', 10)
    expect(data).toHaveProperty('totalElements')
    expect(Array.isArray(data.content)).toBe(true)

    // Students should only see their own submissions
    data.content.forEach((submission: any) => {
      expect(submission.studentId).toBe('student-001')
    })
  })

  it('should return submissions for authenticated instructor with filters', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions?assignmentId=assign-001&status=EVALUATED`, {
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.content.length).toBeGreaterThan(0)
    data.content.forEach((submission: any) => {
      expect(submission.assignmentId).toBe('assign-001')
      expect(submission.status).toBe('EVALUATED')
    })
  })

  it('should return paginated results', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions?page=0&size=1`, {
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.pageNumber).toBe(0)
    expect(data.pageSize).toBe(1)
    expect(data.content.length).toBe(1)
    expect(data.hasNext).toBe(true)
  })

  it('should filter by student ID for instructors', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions?studentId=student-001`, {
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    data.content.forEach((submission: any) => {
      expect(submission.studentId).toBe('student-001')
    })
  })

  it('should deny student access to filter by other student ID', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions?studentId=student-002`, {
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(403)
    const error = await response.json()
    expect(error.error).toBe('Forbidden')
  })

  it('should return 401 for missing authorization', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions`)

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Missing Authorization header')
  })

  it('should return 401 for invalid token format', async () => {
    const response = await fetch(`${baseURL}/api/v1/submissions`, {
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
