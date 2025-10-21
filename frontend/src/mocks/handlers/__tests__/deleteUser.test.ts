import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'
import { mockTokens } from '../../data/users'

describe('DELETE /api/v1/users/{userId} - Delete User', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should delete user successfully for admin', async () => {
    const testUserId = 'student-001' // Use a student user for deletion

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message', 'User deleted successfully')
  })

  it('should return 404 for non-existent user', async () => {
    const nonExistentId = 'non-existent-user'

    const response = await fetch(`/api/v1/users/${nonExistentId}`, {
      method: 'DELETE',
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
    const testUserId = 'student-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'DELETE',
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
    const testUserId = 'student-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'DELETE',
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
    const testUserId = 'student-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'DELETE',
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
    const specialId = 'user-123_abc@test'

    const response = await fetch(`/api/v1/users/${encodeURIComponent(specialId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    // Since this user doesn't exist, it should return 404
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Not Found')
    expect(data).toHaveProperty('message', 'User not found')
  })

  it('should handle instructor trying to delete user', async () => {
    const testUserId = 'student-001'

    const response = await fetch(`/api/v1/users/${testUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${mockTokens.instructor}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Forbidden')
    expect(data).toHaveProperty('message', 'Admin access required')
  })
})
