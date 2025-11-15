/**
 * Instructor Dashboard API Hooks
 * 
 * Cung cấp các hook type-safe để:
 * - Lấy thống kê bảng điều khiển
 * - Lấy bài nộp gần đây cần chấm
 * - Lấy deadline sắp tới
 * 
 * Vietnamese: Các hook API cho Bảng điều khiển Giảng viên
 */

import { useQuery } from '@tanstack/react-query'
import {
  submissionServiceGetAllSubmissions,
  contentServiceGetAllAssignments,
} from '@/api/sdk.gen'
import { handleApiError } from '@/configs/api-error-handler'
import type {
  InstructorDashboardStats,
  RecentSubmissionSummary,
  UpcomingDeadline,
} from '../types/instructor.types'

/**
 * Query key factory for dashboard data
 * Enables intelligent cache management
 */
export const instructorDashboardKeys = {
  all: ['instructor-dashboard'],
  stats: () => [...instructorDashboardKeys.all, 'stats'],
  recentSubmissions: () => [...instructorDashboardKeys.all, 'recent-submissions'],
  upcomingDeadlines: () => [...instructorDashboardKeys.all, 'upcoming-deadlines'],
  analytics: () => [...instructorDashboardKeys.all, 'analytics'],
}

/**
 * Fetch dashboard statistics
 *
 * Vietnamese: Lấy thống kê bảng điều khiển
 * 
 * Fetches:
 * - Active assignments count
 * - Pending evaluations count
 * - Total students
 * - Completion rate
 * - Average score
 *
 * @example
 * const { data, isLoading } = useDashboardStats()
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: instructorDashboardKeys.stats(),
    queryFn: async (): Promise<InstructorDashboardStats> => {
      try {
        // Lấy assignments đang hoạt động
        const assignmentsResult = await contentServiceGetAllAssignments({
          query: {
            page: '0',
            size: '1000', // Get all for now
          },
        })

        // Lấy bài nộp chưa đánh giá
        const submissionsResult = await submissionServiceGetAllSubmissions({
          query: {
            page: '0',
            size: '1000',
          },
        })

        // Build stats from responses
        const assignments = assignmentsResult.data?.content || []
        const submissions = submissionsResult.data?.content || []

        return {
          activeAssignments: assignments.length,
          pendingEvaluations: submissions.length,
          totalStudents: 0, // TODO: Get from API when available
          completionRate: 0, // TODO: Calculate from submissions
          averageScore: 0, // TODO: Get from analytics
        }
      } catch (error) {
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Fetch recent submissions pending evaluation
 *
 * Vietnamese: Lấy bài nộp gần đây cần chấm
 *
 * @param limit - Maximum number of recent submissions (default: 5)
 *
 * @example
 * const { data: submissions, isLoading } = useRecentSubmissions(5)
 */
export function useRecentSubmissions(limit: number = 5) {
  return useQuery({
    queryKey: [
      ...instructorDashboardKeys.recentSubmissions(),
      { limit },
    ],
    queryFn: async (): Promise<RecentSubmissionSummary[]> => {
      try {
        const result = await submissionServiceGetAllSubmissions({
          query: {
            page: '0',
            size: String(limit),
          },
        })

        if (result.error) throw result.error
        if (!result.data?.content) return []

        // Map API response to RecentSubmissionSummary
        return result.data.content.map((submission: any) => ({
          submissionId: submission.id,
          studentName: submission.studentName || 'Unknown',
          assignmentTitle: submission.assignmentTitle || 'Untitled',
          submittedAt: new Date(submission.submittedAt),
          status: submission.status || 'PENDING',
          score: submission.evaluationResult?.score,
        }))
      } catch (error) {
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent updates
    gcTime: 1000 * 60 * 15, // 15 minutes
  })
}

/**
 * Fetch upcoming assignment deadlines
 *
 * Vietnamese: Lấy deadline sắp tới
 *
 * @param daysAhead - Number of days ahead to look (default: 7)
 * @param limit - Maximum number of deadlines (default: 5)
 *
 * @example
 * const { data: deadlines, isLoading } = useUpcomingDeadlines(7, 5)
 */
export function useUpcomingDeadlines(daysAhead: number = 7, limit: number = 5) {
  return useQuery({
    queryKey: [
      ...instructorDashboardKeys.upcomingDeadlines(),
      { daysAhead, limit },
    ],
    queryFn: async (): Promise<UpcomingDeadline[]> => {
      try {
        const result = await contentServiceGetAllAssignments({
          query: {
            page: '0',
            size: '1000',
          },
        })

        if (result.error) throw result.error
        if (!result.data?.content) return []

        const now = new Date()
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

        // Filter assignments with dueDate in next N days
        const upcoming = result.data.content
          .filter((assignment: any) => {
            if (!assignment.dueDate) return false
            const dueDate = new Date(assignment.dueDate)
            return dueDate >= now && dueDate <= futureDate
          })
          .sort((a: any, b: any) => {
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
          })
          .slice(0, limit)
          .map((assignment: any) => {
            const dueDate = new Date(assignment.dueDate)
            const daysRemaining = Math.ceil(
              (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )

            return {
              assignmentId: assignment.id,
              assignmentTitle: assignment.title,
              dueDate,
              daysRemaining,
              submissionCount: 0, // TODO: Get from submissions count
              totalStudents: 0, // TODO: Get from class API
            }
          })

        return upcoming
      } catch (error) {
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}
