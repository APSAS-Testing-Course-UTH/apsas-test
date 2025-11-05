/**
 * Performance Data Hook
 * Fetches submissions and aggregates performance metrics
 */

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { submissionServiceGetAllSubmissions } from '@/api/sdk.gen'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'
import type {
  PerformanceStats,
  PerformanceTrendPoint,
  SkillProgress,
} from '../types'

/**
 * Aggregate performance statistics from submissions
 */
function aggregateStats(submissions: SubmissionServiceSubmissionResponse[]): PerformanceStats {
  if (!submissions.length) {
    return {
      totalSubmissions: 0,
      passedSubmissions: 0,
      failedSubmissions: 0,
      successRate: 0,
      averageScore: 0,
      totalSkillsAttempted: 0,
      skillsPassedCount: 0,
    }
  }

  const passedSubmissions = submissions.filter((s) => s.result === 'PASSED').length
  const failedSubmissions = submissions.length - passedSubmissions

  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0)
  const averageScore = Math.round(totalScore / submissions.length)

  const successRate = Math.round((passedSubmissions / submissions.length) * 100)

  // Extract unique skills - count test cases as skills
  const skillsAttempted = new Set<string>()
  const skillsPassed = new Set<string>()

  submissions.forEach((s) => {
    if (s.testCaseResults?.length) {
      s.testCaseResults.forEach((tc, index) => {
        // Use test case order as skill ID
        const skillId = `test-${index}`
        skillsAttempted.add(skillId)
        if (tc.passed) {
          skillsPassed.add(skillId)
        }
      })
    }
  })

  return {
    totalSubmissions: submissions.length,
    passedSubmissions,
    failedSubmissions,
    successRate,
    averageScore,
    totalSkillsAttempted: skillsAttempted.size,
    skillsPassedCount: skillsPassed.size,
  }
}

/**
 * Create trend data for charts
 */
function createTrendData(submissions: SubmissionServiceSubmissionResponse[]): PerformanceTrendPoint[] {
  return submissions
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt || '').getTime()
      const dateB = new Date(b.submittedAt || '').getTime()
      return dateA - dateB
    })
    .map((submission) => ({
      date: new Date(submission.submittedAt || '').toLocaleDateString('vi-VN'),
      score: submission.score || 0,
      status: submission.result === 'PASSED' ? ('passed' as const) : ('failed' as const),
      assignmentTitle: submission.assignmentId || 'Bài tập',
      submissionId: submission.id || '',
    }))
}

/**
 * Calculate skill progress
 */
function calculateSkillProgress(
  submissions: SubmissionServiceSubmissionResponse[]
): SkillProgress[] {
  const skillMap = new Map<string, { passed: number; total: number; lastDate?: Date }>()

  submissions.forEach((submission) => {
    if (submission.testCaseResults?.length) {
      submission.testCaseResults.forEach((tc, index) => {
        const skillId = `test-${index}`
        const existing = skillMap.get(skillId) || { passed: 0, total: 0 }
        existing.total += 1
        if (tc.passed) {
          existing.passed += 1
        }
        existing.lastDate = submission.submittedAt
        skillMap.set(skillId, existing)
      })
    }
  })

  return Array.from(skillMap.entries()).map(([skillId, data]) => ({
    skillId,
    skillName: `Kỹ năng ${skillId}`, // Use skill ID as display
    attemptCount: data.total,
    passCount: data.passed,
    progressPercentage: Math.round((data.passed / data.total) * 100),
    lastAttemptDate: data.lastDate ? data.lastDate.toLocaleDateString('vi-VN') : null,
  }))
}

/**
 * Hook to fetch and aggregate performance data
 */
export function usePerformanceData(studentId?: string) {
  const { data: submissionsData, isLoading, error } = useQuery({
    queryKey: ['submissions', 'performance', studentId],
    queryFn: async () => {
      const response = await submissionServiceGetAllSubmissions({
        query: {
          page: '0',
          size: '100', // Get up to 100 submissions for analytics
          ...(studentId && { studentId }),
        },
      })
      return response
    },
  })

  const submissions = (submissionsData?.data?.content as SubmissionServiceSubmissionResponse[]) || []

  // Memoize calculations to avoid recalculation on every render
  const stats = useMemo(() => aggregateStats(submissions), [submissions])
  const trendData = useMemo(() => createTrendData(submissions), [submissions])
  const skillProgress = useMemo(() => calculateSkillProgress(submissions), [submissions])

  return {
    stats,
    trendData,
    skillProgress,
    submissions,
    isLoading,
    error,
    isEmpty: submissions.length === 0,
  }
}

