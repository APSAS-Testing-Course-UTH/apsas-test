import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Provider Index Route - Redirects to dashboard
 * 
 * Khi truy cập /provider, sẽ redirect tới /provider/dashboard
 */
export const Route = createFileRoute('/_authenticated/provider/')(
  {
    beforeLoad: () => {
      // Redirect to dashboard when accessing /provider directly
      throw redirect({ to: '/provider/dashboard' })
    },
  }
)
