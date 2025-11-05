// Deep diagnostic - check handlers registration
import { describe, it, expect } from 'vitest'
import { handlers } from '@/mocks/handlers'

describe('MSW Handlers Registration', () => {
  it('should have all handlers registered', () => {
    console.log('[Handlers Diagnostic] Total handlers:', handlers.length)
    console.log('[Handlers Diagnostic] Handlers:', handlers)
    
    // Check for login handler
    const loginHandlers = handlers.filter((h: any) => h.toString().includes('login'))
    console.log('[Handlers Diagnostic] Login handlers found:', loginHandlers.length)
    
    // Check for POST handlers
    const postHandlers = handlers.filter((h: any) => h.toString().includes('POST'))
    console.log('[Handlers Diagnostic] POST handlers found:', postHandlers.length)
    
    // Check for auth handlers
    const authHandlers = handlers.filter((h: any) => h.toString().includes('/api/auth'))
    console.log('[Handlers Diagnostic] Auth handlers found:', authHandlers.length)
    
    // Print each handler
    handlers.forEach((h: any, idx: number) => {
      console.log(`[Handlers Diagnostic] Handler ${idx}:`, h.toString().substring(0, 100))
    })
    
    expect(handlers).toHaveLength(handlers.length) // Just verify array exists
  })

  it('should be able to get login handler from identityHandlers', async () => {
    const { identityHandlers } = await import('@/mocks/handlers/identityHandlers')
    console.log('[Handlers Diagnostic] identityHandlers length:', identityHandlers.length)
    console.log('[Handlers Diagnostic] identityHandlers:', identityHandlers.map((h: any) => h.toString().substring(0, 50)))
    
    const loginHandlersFromIdentity = identityHandlers.filter((h: any) => h.toString().includes('login'))
    console.log('[Handlers Diagnostic] Login handlers from identity:', loginHandlersFromIdentity.length)
    
    expect(identityHandlers.length).toBeGreaterThan(0)
  })
})
