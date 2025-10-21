import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '../../server'

describe('MSW Login Handler', () => {
  const baseURL = 'http://localhost:3000'

  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })
  it('should return token for valid credentials', async () => {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@apsas.edu.vn',
        password: 'Admin@123',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('type', 'Bearer')
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('email', 'admin@apsas.edu.vn')
    expect(data.user).toHaveProperty('role', 'ADMIN')
  })

  it('should return error for invalid credentials', async () => {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      }),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Unauthorized')
  })
})
