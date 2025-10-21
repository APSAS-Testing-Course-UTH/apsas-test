import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '@/mocks/server'

describe('MSW Verify Email Handler', () => {
  const baseURL = 'http://localhost:3000'
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('should verify email with valid token', async () => {
    const response = await fetch(`${baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'valid-verification-token',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toContain('Email has been verified successfully')
  })

  it('should return 400 for missing token', async () => {
    const response = await fetch(`${baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Verification token is required')
  })

  it('should return 400 for empty token', async () => {
    const response = await fetch(`${baseURL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: '',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Bad Request')
    expect(data.message).toContain('Verification token is required')
  })

  it('should return 500 for invalid JSON', async () => {
    const response = await fetch(`${baseURL}/api/auth/verify-email`, {
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
