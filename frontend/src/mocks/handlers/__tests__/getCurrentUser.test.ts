import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'
import { mockUsers, mockTokens } from '../../data/users'

describe('GET /api/v1/users/me', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })
  it('should return current user profile for authenticated admin', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      id: mockUsers.admin1.id,
      email: mockUsers.admin1.email,
      firstName: mockUsers.admin1.firstName,
      lastName: mockUsers.admin1.lastName,
      role: 'ADMIN',
      isActive: mockUsers.admin1.isActive,
      isEmailVerified: mockUsers.admin1.isEmailVerified,
      createdAt: mockUsers.admin1.createdAt,
      updatedAt: mockUsers.admin1.updatedAt,
    })
  })

  it('should return current user profile for authenticated instructor', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.instructor}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      id: mockUsers.instructor1.id,
      email: mockUsers.instructor1.email,
      firstName: mockUsers.instructor1.firstName,
      lastName: mockUsers.instructor1.lastName,
      role: 'INSTRUCTOR',
      isActive: mockUsers.instructor1.isActive,
      isEmailVerified: mockUsers.instructor1.isEmailVerified,
      createdAt: mockUsers.instructor1.createdAt,
      updatedAt: mockUsers.instructor1.updatedAt,
    })
  })

  it('should return current user profile for authenticated student', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.student}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      id: mockUsers.student1.id,
      email: mockUsers.student1.email,
      firstName: mockUsers.student1.firstName,
      lastName: mockUsers.student1.lastName,
      role: 'STUDENT',
      isActive: mockUsers.student1.isActive,
      isEmailVerified: mockUsers.student1.isEmailVerified,
      createdAt: mockUsers.student1.createdAt,
      updatedAt: mockUsers.student1.updatedAt,
    })
  })

  it('should return current user profile for authenticated provider', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockTokens.provider}`,
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toEqual({
      id: mockUsers.provider1.id,
      email: mockUsers.provider1.email,
      firstName: mockUsers.provider1.firstName,
      lastName: mockUsers.provider1.lastName,
      role: 'CONTENT_PROVIDER',
      isActive: mockUsers.provider1.isActive,
      isEmailVerified: mockUsers.provider1.isEmailVerified,
      createdAt: mockUsers.provider1.createdAt,
      updatedAt: mockUsers.provider1.updatedAt,
    })
  })

  it('should return 401 when no authorization header provided', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Missing Authorization header')
  })

  it('should return 401 when invalid token format provided', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'InvalidTokenFormat',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Invalid token format')
  })

  it('should return 401 when invalid token provided', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Invalid token')
  })
})
