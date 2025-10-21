import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { server } from '@/mocks/server'

// Simple test to validate MSW handlers are working
describe('MSW Handlers Validation', () => {
  const baseURL = 'http://localhost:3000'
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  it('should have handlers defined', () => {
    // This test just validates that the server can start without errors
    expect(server).toBeDefined()
  })

  it('should handle identity service login', async () => {
    const response = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@apsas.edu.vn',
        password: 'Admin@123'
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('type')
  })

  it('should handle content service tutorials', async () => {
    const response = await fetch(`${baseURL}/api/v1/tutorials`, {
      headers: { 'Authorization': 'Bearer provider-token' }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('content')
    expect(Array.isArray(data.content)).toBe(true)
  })
})
