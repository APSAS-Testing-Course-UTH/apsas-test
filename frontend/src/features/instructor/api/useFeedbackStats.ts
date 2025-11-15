/**
 * Feedback API Hooks
 * Vietnamese: Hooks cho API Phản hồi
 * 
 * Now uses real submissions API instead of mock data
 */

import { useQuery } from '@tanstack/react-query'
import { submissionServiceGetAllSubmissions } from '@/api/sdk.gen'
import type { FeedbackStats, FeedbackItem } from '../components/FeedbackOverview'

/**
 * Get feedback statistics for instructor
 * Uses real submissions data to calculate stats
 */
export function useFeedbackStats() {
  return useQuery({
    queryKey: ['instructor', 'feedback', 'stats'],
    queryFn: async (): Promise<FeedbackStats> => {
      // Fetch all submissions (large page size to get all for stats)
      const result = await submissionServiceGetAllSubmissions({
        query: {
          page: '0',
          size: '1000', // Get all submissions for accurate stats
        },
      })

      if (result.error) throw result.error
      if (!result.data?.content) {
        return {
          totalSubmissions: 0,
          submissionsWithFeedback: 0,
          submissionsPending: 0,
          submissionsWithoutFeedback: 0,
          avgFeedbackTime: 0,
        }
      }

      const submissions = result.data.content

      // Calculate stats from real submissions
      const totalSubmissions = submissions.length
      const submissionsWithFeedback = submissions.filter(
        (s: any) => s.feedback && s.feedback.trim().length > 0
      ).length
      const submissionsPending = submissions.filter(
        (s: any) => s.status === 'PENDING' || s.status === 'EVALUATED'
      ).length
      const submissionsWithoutFeedback = submissions.filter(
        (s: any) => !s.feedback || s.feedback.trim().length === 0
      ).length

      // Calculate average feedback time (mock for now - would need feedback timestamps)
      const avgFeedbackTime = 24.5

      return {
        totalSubmissions,
        submissionsWithFeedback,
        submissionsPending,
        submissionsWithoutFeedback,
        avgFeedbackTime,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get feedback history
 * Uses real submissions data instead of mock
 */
export function useFeedbackHistory() {
  return useQuery({
    queryKey: ['instructor', 'feedback', 'history'],
    queryFn: async (): Promise<FeedbackItem[]> => {
      // Fetch submissions with pagination
      const result = await submissionServiceGetAllSubmissions({
        query: {
          page: '0',
          size: '50', // Get recent submissions
        },
      })

      if (result.error) throw result.error
      if (!result.data?.content) return []

      const submissions = result.data.content

      // Transform submissions to FeedbackItem format
      return submissions.map((sub: any) => ({
        submissionId: sub.id || '',
        studentName: sub.studentName || 'Unknown',
        studentEmail: sub.studentEmail || 'N/A',
        assignmentTitle: sub.assignmentTitle || 'Bài tập',
        submittedAt: sub.submittedAt || new Date().toISOString(),
        feedbackProvidedAt: sub.feedback && sub.feedback.trim().length > 0 
          ? sub.updatedAt 
          : undefined,
        feedbackText: sub.feedback || undefined,
        score: sub.score || 0,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
