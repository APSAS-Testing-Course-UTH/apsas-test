/**
 * Student Submissions List Index Route
 * Path: /_authenticated/student/submissions/
 * 
 * Displays list of all student's submissions with filters
 * Protected: STUDENT role only
 */

import { createFileRoute } from '@tanstack/react-router'
import { SubmissionsList } from '@/features/submissions/components/SubmissionsList'

// Component trang danh sách bài nộp
const SubmissionsIndex = () => {
  return <SubmissionsList />
}

// Index route for submissions list
export const Route = createFileRoute('/_authenticated/student/submissions/')(
  {
    component: SubmissionsIndex,
  }
)
