import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Instructor Index Route - Redirects to dashboard
 * 
 * This route handles direct navigation to /instructor by redirecting
 * to the main instructor dashboard at /instructor/dashboard
 * 
 * Created: Week 1, Day 1
 */
export const Route = createFileRoute('/_authenticated/instructor/')({
  beforeLoad: () => {
    // Redirect to dashboard when accessing /instructor directly
    throw redirect({ to: '/instructor/dashboard' })
  },
})
