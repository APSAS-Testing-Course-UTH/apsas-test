import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Student Index Route - Redirects to dashboard
 * 
 * This route handles direct navigation to /student by redirecting
 * to the main student dashboard at /student/dashboard
 */
export const Route = createFileRoute('/_authenticated/student/')({
  beforeLoad: () => {
    // Redirect to dashboard when accessing /student directly
    throw redirect({ to: '/student/dashboard' })
  }
})
