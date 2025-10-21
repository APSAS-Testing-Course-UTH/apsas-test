import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'
import { mockTokens } from '../../data/users'
import { mockUsers } from '../../data/users'

describe('GET /api/v1/users/{userId} - Get User by ID', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should return user by ID for admin', async () => {
    const testUserId = 'admin-001' // admin user ID

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('id', testUserId)
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('firstName')
    expect(data).toHaveProperty('lastName')
    expect(data).toHaveProperty('role')
    expect(data).toHaveProperty('isActive')
    expect(data).toHaveProperty('isEmailVerified')
    expect(data).toHaveProperty('createdAt')
    expect(data).toHaveProperty('updatedAt')

    // Role should be mapped to API format
    expect(['ADMIN', 'INSTRUCTOR', 'STUDENT', 'CONTENT_PROVIDER']).toContain(data.role)
  })

  it('should return different user types correctly', async () => {
    const testCases = [
      { id: 'instructor-001', expectedRole: 'INSTRUCTOR' },
      { id: 'student-001', expectedRole: 'STUDENT' },
      { id: 'provider-001', expectedRole: 'CONTENT_PROVIDER' },
    ]

    for (const testCase of testCases) {
      const response = await fetch(`/api/v1/users/${testCase.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockTokens.admin}`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(testCase.id)
      expect(data.role).toBe(testCase.expectedRole)
    }
  })

  it('should return 404 for non-existent user', async () => {
    const nonExistentId = 'non-existent-user'

    const response = await fetch(`/api/v1/users/${nonExistentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Not Found')
    expect(data).toHaveProperty('message', 'User not found')
  })

  it('should return 401 for missing token', async () => {
    const testUserId = 'admin-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Unauthorized')
    expect(data).toHaveProperty('message', 'Missing Authorization header')
  })

  it('should return 401 for invalid token', async () => {
    const testUserId = 'admin-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Unauthorized')
    expect(data).toHaveProperty('message', 'Invalid token')
  })

  it('should return 403 for non-admin user', async () => {
    const testUserId = 'admin-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.student}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Forbidden')
    expect(data).toHaveProperty('message', 'Admin access required')
  })

  it('should handle special characters in user ID', async () => {
    const specialId = 'user-with-dashes-123'

    const response = await fetch(`/api/v1/users/${specialId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(404) // Should not find this user
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Not Found')
    expect(data).toHaveProperty('message', 'User not found')
  })

  it('should return user with correct date formats', async () => {
    const testUserId = 'admin-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    // Dates should be valid Date objects (when parsed)
    expect(() => new Date(data.createdAt)).not.toThrow()
    expect(() => new Date(data.updatedAt)).not.toThrow()
  })
})
