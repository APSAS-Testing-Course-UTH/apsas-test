/**
 * Performance Feature Types
 * Types for performance analytics, charts, and data aggregation
 */

import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

/**
 * Aggregated performance statistics for a student
 */
export interface PerformanceStats {
  totalSubmissions: number
  passedSubmissions: number
  failedSubmissions: number
  successRate: number // 0-100
  averageScore: number // 0-100
  totalSkillsAttempted: number
  skillsPassedCount: number
}

/**
 * Performance trend data point for charting
 */
export interface PerformanceTrendPoint {
  date: string // YYYY-MM-DD format for x-axis
  score: number
  status: 'passed' | 'failed'
  assignmentTitle: string
  submissionId: string
}

/**
 * Skill progress data
 */
export interface SkillProgress {
  skillId: string
  skillName: string
  attemptCount: number
  passCount: number
  progressPercentage: number // 0-100
  lastAttemptDate: string | null
}

/**
 * Assignment submission with calculated metrics
 */
export interface SubmissionMetrics extends SubmissionServiceSubmissionResponse {
  daysSinceSubmission: number
  performanceChange?: number // Change from previous submission
}

/**
 * Performance data for Vietnamese UI labels
 */
export const PERFORMANCE_LABELS = {
  totalSubmissions: 'Tổng bài nộp',
  passedSubmissions: 'Bài đạt',
  failedSubmissions: 'Bài không đạt',
  successRate: 'Tỷ lệ thành công',
  averageScore: 'Điểm trung bình',
  skillsPassedCount: 'Kỹ năng đạt',
  scoreOverTime: 'Điểm theo thời gian',
  skillProgress: 'Tiến độ kỹ năng',
  submissionHistory: 'Lịch sử nộp bài',
  noData: 'Chưa có dữ liệu',
  loading: 'Đang tải dữ liệu...',
  error: 'Lỗi tải dữ liệu',
  refresh: 'Làm mới',
  exportData: 'Xuất dữ liệu',
}
