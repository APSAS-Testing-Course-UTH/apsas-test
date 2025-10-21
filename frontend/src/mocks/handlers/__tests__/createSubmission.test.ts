import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('POST /api/v1/submissions', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should create submission for authenticated student', async () => {
    const submissionData = {
      assignmentId: 'assign-001',
      code: 'function test() { return "Hello World"; }',
      language: 'javascript',
    }

    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('id')
    expect(data.assignmentId).toBe(submissionData.assignmentId)
    expect(data.code).toBe(submissionData.code)
    expect(data.language).toBe(submissionData.language)
    expect(data.studentId).toBe('student-001')
    expect(data.status).toBe('PENDING')
    expect(data).toHaveProperty('submittedAt')
  })

  it('should return 400 for missing required fields', async () => {
    const incompleteData = {
      code: 'function test() { return "Hello"; }',
      language: 'javascript',
    }

    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer student-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    })

    expect(response.status).toBe(400)
    const error = await response.json()
    expect(error.error).toBe('Bad Request')
    expect(error.message).toContain('Missing required fields')
  })

  it('should deny creation for non-student users', async () => {
    const submissionData = {
      assignmentId: 'assign-001',
      code: 'function test() { return "Hello World"; }',
      language: 'javascript',
    }

    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer instructor-001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(403)
    const error = await response.json()
    expect(error.error).toBe('Forbidden')
    expect(error.message).toBe('Only students can create submissions')
  })

  it('should return 401 for missing authorization', async () => {
    const submissionData = {
      assignmentId: 'assign-001',
      code: 'function test() { return "Hello World"; }',
      language: 'javascript',
    }

    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Missing Authorization header')
  })

  it('should return 401 for invalid token format', async () => {
    const submissionData = {
      assignmentId: 'assign-001',
      code: 'function test() { return "Hello World"; }',
      language: 'javascript',
    }

    const response = await fetch(`${baseURL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Authorization': 'InvalidToken',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
    expect(error.message).toBe('Invalid token format')
  })
})
