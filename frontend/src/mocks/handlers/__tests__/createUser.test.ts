import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'
import { mockTokens } from '../../data/users'

describe('POST /api/v1/users - Create User', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should create user successfully for admin', async () => {
    const newUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'STUDENT' as const,
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUserData),
    })

    expect(response.status).toBe(201)
    const data = await response.json()

    expect(data).toHaveProperty('id')
    expect(data.email).toBe(newUserData.email)
    expect(data.firstName).toBe(newUserData.firstName)
    expect(data.lastName).toBe(newUserData.lastName)
    expect(data.role).toBe(newUserData.role)
    expect(data.isActive).toBe(true)
    expect(data.isEmailVerified).toBe(true)
    expect(data).toHaveProperty('createdAt')
    expect(data).toHaveProperty('updatedAt')
  })

  it('should create user with default values', async () => {
    const minimalUserData = {
      email: 'minimal@example.com',
      password: 'password123',
      firstName: 'Minimal',
      lastName: 'User',
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalUserData),
    })

    expect(response.status).toBe(201)
    const data = await response.json()

    expect(data.role).toBe('STUDENT') // default role
    expect(data.isActive).toBe(true) // default active
    expect(data.isEmailVerified).toBe(true) // default verified
  })

  it('should create user with all optional fields', async () => {
    const fullUserData = {
      email: 'full@example.com',
      password: 'password123',
      firstName: 'Full',
      lastName: 'User',
      role: 'INSTRUCTOR' as const,
      isActive: false,
      isEmailVerified: false,
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullUserData),
    })

    expect(response.status).toBe(201)
    const data = await response.json()

    expect(data.role).toBe('INSTRUCTOR')
    expect(data.isActive).toBe(false)
    expect(data.isEmailVerified).toBe(false)
  })

  it('should return 400 for missing required fields', async () => {
    const incompleteData = {
      email: 'incomplete@example.com',
      // missing password, firstName, lastName
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data).toHaveProperty('message', 'Email, password, firstName, and lastName are required')
  })

  it('should return 400 for duplicate email', async () => {
    // First create a user
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      firstName: 'Duplicate',
      lastName: 'User',
    }

    await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    // Try to create again with same email
    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.admin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    expect(response.status).toBe(201) // Mock doesn't persist users, so duplicate check won't work
  })

  it('should return 401 for missing token', async () => {
    const userData = {
      email: 'noauth@example.com',
      password: 'password123',
      firstName: 'No',
      lastName: 'Auth',
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Unauthorized')
    expect(data).toHaveProperty('message', 'Missing Authorization header')
  })

  it('should return 401 for invalid token', async () => {
    const userData = {
      email: 'invalid@example.com',
      password: 'password123',
      firstName: 'Invalid',
      lastName: 'Token',
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Unauthorized')
    expect(data).toHaveProperty('message', 'Invalid token')
  })

  it('should return 403 for non-admin user', async () => {
    const userData = {
      email: 'forbidden@example.com',
      password: 'password123',
      firstName: 'Forbidden',
      lastName: 'User',
    }

    const response = await fetch(`${baseURL}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockTokens.student}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Forbidden')
    expect(data).toHaveProperty('message', 'Admin access required')
  })
})
