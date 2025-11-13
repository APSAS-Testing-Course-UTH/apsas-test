import { setupServer } from 'msw/node'
import { handlers } from './handlers'

console.log(`[MSW Server] Initializing with ${handlers?.length || 0} handlers`)

export const server = setupServer(...handlers)

export const startServer = () => {
  if (process.env.NODE_ENV === 'test') {
    server.listen({
      onUnhandledRequest: 'bypass',
    })
    console.log('🧪 MSW server started for testing')
  }
}

export const stopServer = () => {
  server.close()
}
