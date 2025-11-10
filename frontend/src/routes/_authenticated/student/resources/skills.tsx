import { createFileRoute, Outlet } from '@tanstack/react-router'

// Layout route that just provides an outlet for child routes
export const Route = createFileRoute('/_authenticated/student/resources/skills')({
  component: () => <Outlet />,
})
