import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '@/mocks/server'

describe('MSW Resend Verification Handler', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should resend verification email for existing user', async () => {
    const response = await fetch(`${baseURL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toContain('verification email has been sent')
  })

  it('should return success message for non-existing user (security)', async () => {
    const response = await fetch(`${baseURL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toContain('verification email has been sent')
  })

  it('should return 400 for missing email', async () => {
    const response = await fetch(`${baseURL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Email is required')
  })

  it('should return 500 for invalid JSON', async () => {
    const response = await fetch(`${baseURL}/api/auth/resend-verification`, {
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
