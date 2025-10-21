import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('MSW Register Handler', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })
  it('should create new user account', async () => {
    const response = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('type', 'Bearer')
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('email', 'newuser@example.com')
    expect(data.user).toHaveProperty('firstName', 'John')
    expect(data.user).toHaveProperty('lastName', 'Doe')
    expect(data.user).toHaveProperty('role', 'STUDENT')
    expect(data.user).toHaveProperty('isActive', true)
  })

  it('should return 400 for invalid input', async () => {
    const response = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123', // Too short
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })
})
