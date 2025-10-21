import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '../../server'
import { mockTokens } from '../../data/users'

describe('POST /api/v1/users/me/change-password', () => {
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

  it('should change password successfully', async () => {
    const changeData = {
      currentPassword: 'Admin@123',
      newPassword: 'newpassword123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Password changed successfully')
  })

  it('should return 400 when current password is incorrect', async () => {
    const changeData = {
      currentPassword: 'wrongpassword',
      newPassword: 'newpassword123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.student}`
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toBe('Current password is incorrect')
  })

  it('should return 400 when new password is too short', async () => {
    const changeData = {
      currentPassword: 'student123',
      newPassword: 'short'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.student}`
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toBe('New password must be at least 8 characters long')
  })

  it('should return 400 when current password is missing', async () => {
    const changeData = {
      newPassword: 'newpassword123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toBe('Current password and new password are required')
  })

  it('should return 400 when new password is missing', async () => {
    const changeData = {
      currentPassword: 'admin123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toBe('Current password and new password are required')
  })

  it('should return 401 when no authorization header', async () => {
    const changeData = {
      currentPassword: 'admin123',
      newPassword: 'newpassword123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Missing Authorization header')
  })

  it('should return 401 with invalid token', async () => {
    const changeData = {
      currentPassword: 'admin123',
      newPassword: 'newpassword123'
    }

    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify(changeData)
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(data.message).toBe('Invalid token')
  })

  it('should return 500 on internal server error', async () => {
    const response = await fetch(`${baseURL}/api/v1/users/me/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockTokens.admin}`
      },
      body: 'invalid json'
    })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal Server Error')
    expect(data.message).toBe('Failed to parse request body')
  })
})
