import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export const startWorker = async () => {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    console.log('🚀 MSW browser worker started')
  }
}

export const stopWorker = () => {
  worker.stop()
}