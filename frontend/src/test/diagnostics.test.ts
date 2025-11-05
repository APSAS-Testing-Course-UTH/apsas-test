// Diagnostic test to check if MSW server is running
import { describe, it, expect, beforeAll } from 'vitest'

describe('MSW Diagnostics', () => {
  beforeAll(async () => {
    console.log('[Diagnostics] beforeAll running')
    console.log('[Diagnostics] localStorage:', localStorage.getItem('apsas_token'))
    console.log('[Diagnostics] globalThis.fetch:', typeof globalThis.fetch)
    
    // Try to see if server is imported
    try {
      const { server } = await import('@/mocks/server')
      console.log('[Diagnostics] Server imported successfully')
      console.log('[Diagnostics] Server object:', server ? 'exists' : 'null')
      console.log('[Diagnostics] Server.listen:', typeof server?.listen)
    } catch (e) {
      console.error('[Diagnostics] Failed to import server:', e)
    }
  })

  it('should have localStorage token', () => {
    const token = localStorage.getItem('apsas_token')
    console.log('[Diagnostics Test] Token:', token)
    expect(token).toBe('student_student-001')
  })

  it('should have undici fetch', () => {
    console.log('[Diagnostics Test] fetch type:', typeof globalThis.fetch)
    console.log('[Diagnostics Test] fetch name:', globalThis.fetch.name)
    expect(globalThis.fetch).toBeDefined()
  })

  it('should make a test API call', async () => {
    console.log('[Diagnostics Test] Making test API call...')
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer student_student-001'
        },
        body: JSON.stringify({ email: 'admin@apsas.edu.vn', password: 'Admin@123' })
      })
      console.log('[Diagnostics Test] Response status:', response.status)
      const data = await response.json()
      console.log('[Diagnostics Test] Response data:', data)
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('token')
    } catch (error) {
      console.error('[Diagnostics Test] Fetch failed:', error)
      throw error
    }
  })
})
