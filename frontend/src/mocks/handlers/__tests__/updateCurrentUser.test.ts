import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../../server'
import { mockTokens } from '../../data/users'

describe('PUT /api/v1/users/me', () => {
  const baseURL = 'http://localhost:3000'
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  it('should update user profile successfully', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.firstName).toBe('Updated')
    expect(data.lastName).toBe('Name')
    expect(data.email).toBe('admin@apsas.edu.vn')
    expect(data.role).toBe('ADMIN')
  })

  it('should update only firstName', async () => {
    const updateData = {
      firstName: 'NewFirstName'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.student}`
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.firstName).toBe('NewFirstName')
    expect(data.lastName).toBe('Student') // Should remain unchanged
  })

  it('should update only lastName', async () => {
    const updateData = {
      lastName: 'NewLastName'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.instructor}`
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.firstName).toBe('John') // Should remain unchanged
    expect(data.lastName).toBe('NewLastName')
  })

  it('should return 400 when no fields provided', async () => {
    const updateData = {}

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toBe('At least one field (firstName or lastName) must be provided')
  })

  it('should return 401 when no authorization header', async () => {
    const updateData = {
      firstName: 'Test'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Missing Authorization header')
  })

  it('should return 401 with invalid token', async () => {
    const updateData = {
      firstName: 'Test'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Invalid token')
  })

  it('should return 500 on internal server error', async () => {
    // This would require mocking a server error scenario
    // For now, we'll test with malformed JSON to trigger error handling
    const response = await fetch(`${baseURL}/api/v1/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: 'invalid json'
    })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal Server Error')
    expect(data.message).toBe('Failed to update user profile')
  })
})
