import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '@/mocks/server'

describe('MSW Reset Password Handler', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should return 400 for invalid reset token', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid-reset-token',
        newPassword: 'newpassword123',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Invalid or expired reset token')
  })

  it('should return 400 for missing token', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newPassword: 'newpassword123',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Token and new password are required')
  })

  it('should return 400 for missing new password', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid-reset-token',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Token and new password are required')
  })

  it('should return 400 for password too short', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid-reset-token',
        newPassword: 'short',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Password must be at least 8 characters long')
  })

  it('should return 400 for empty token', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: '',
        newPassword: 'newpassword123',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Token and new password are required')
  })

  it('should return 500 for invalid JSON', async () => {
    const response = await fetch(`${baseURL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })
})
