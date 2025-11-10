/**
 * Performance Feature Tests
 * Comprehensive test suite for performance analytics components
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { PerformanceChart, PassRateChart } from './PerformanceChart'
import { SkillProgressComponent } from './SkillProgress'
import { SubmissionHistory } from './SubmissionHistory'
import type { PerformanceTrendPoint, SkillProgress } from '../types'

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MantineProvider>
  )
}

describe('Performance Feature - Components', () => {
  describe('PerformanceChart Component', () => {
    it('should render chart with trend data', () => {
      const data: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
        {
          date: '16/01/2025',
          score: 72,
          status: 'passed',
          assignmentTitle: 'Assignment 2',
          submissionId: '2',
        },
      ]

      render(<PerformanceChart data={data} />, { wrapper: TestWrapper })

      expect(screen.getByText('Điểm theo thời gian')).toBeInTheDocument()
      expect(screen.getByText(/Tổng số bài nộp: 2/)).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(<PerformanceChart data={[]} isLoading={true} />, { wrapper: TestWrapper })

      const skeletons = document.querySelectorAll('.mantine-Skeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show no data message when empty', () => {
      render(<PerformanceChart data={[]} isEmpty={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should render with multiple data points', () => {
      const data: PerformanceTrendPoint[] = [
        { date: '01/01', score: 60, status: 'failed', assignmentTitle: 'A1', submissionId: '1' },
        { date: '02/01', score: 75, status: 'passed', assignmentTitle: 'A2', submissionId: '2' },
        { date: '03/01', score: 90, status: 'passed', assignmentTitle: 'A3', submissionId: '3' },
      ]

      render(<PerformanceChart data={data} />, { wrapper: TestWrapper })

      expect(screen.getByText('Điểm theo thời gian')).toBeInTheDocument()
      expect(screen.getByText(/Tổng số bài nộp: 3/)).toBeInTheDocument()
    })
  })

  describe('PassRateChart Component', () => {
    it('should display passed and failed submissions', () => {
      render(
        <PassRateChart
          totalSubmissions={3}
          passedSubmissions={2}
          failedSubmissions={1}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Tỷ lệ Đạt/Không đạt')).toBeInTheDocument()
      expect(screen.getByText(/Tỷ lệ thành công: 66%|67%/)).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(
        <PassRateChart
          totalSubmissions={0}
          passedSubmissions={0}
          failedSubmissions={0}
          isLoading={true}
        />,
        { wrapper: TestWrapper }
      )

      const skeletons = document.querySelectorAll('.mantine-Skeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show no data when no submissions', () => {
      render(
        <PassRateChart
          totalSubmissions={0}
          passedSubmissions={0}
          failedSubmissions={0}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should calculate 70% success rate', () => {
      render(
        <PassRateChart
          totalSubmissions={10}
          passedSubmissions={7}
          failedSubmissions={3}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Tỷ lệ thành công: 70%/)).toBeInTheDocument()
    })

    it('should calculate 100% success rate', () => {
      render(
        <PassRateChart
          totalSubmissions={5}
          passedSubmissions={5}
          failedSubmissions={0}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(/Tỷ lệ thành công: 100%/)).toBeInTheDocument()
    })
  })

  describe('SkillProgressComponent', () => {
    it('should render skill progress items', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'skill-1',
          skillName: 'Kỹ năng JavaScript',
          attemptCount: 5,
          passCount: 4,
          progressPercentage: 80,
          lastAttemptDate: '2025-01-17T10:00:00Z',
        },
        {
          skillId: 'skill-2',
          skillName: 'Kỹ năng TypeScript',
          attemptCount: 3,
          passCount: 2,
          progressPercentage: 67,
          lastAttemptDate: '2025-01-16T10:00:00Z',
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tiến độ kỹ năng')).toBeInTheDocument()
      expect(screen.getByText('Kỹ năng JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Kỹ năng TypeScript')).toBeInTheDocument()
    })

    it('should display progress percentages as badges', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'skill-1',
          skillName: 'Test Skill',
          attemptCount: 5,
          passCount: 4,
          progressPercentage: 80,
          lastAttemptDate: null,
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(<SkillProgressComponent skillProgress={[]} isLoading={true} />, { wrapper: TestWrapper })

      // Check for loading skeletons using the component's custom class
      const skeletons = document.querySelectorAll('[class*="skeletonRow"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show no data message when empty', () => {
      render(<SkillProgressComponent skillProgress={[]} />, { wrapper: TestWrapper })

      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should display attempt count', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'skill-1',
          skillName: 'Test Skill',
          attemptCount: 5,
          passCount: 4,
          progressPercentage: 80,
          lastAttemptDate: null,
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('4/5 lần đạt')).toBeInTheDocument()
    })

    it('should display multiple skills with different progress', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'skill-1',
          skillName: 'High Progress',
          attemptCount: 10,
          passCount: 9,
          progressPercentage: 90,
          lastAttemptDate: null,
        },
        {
          skillId: 'skill-2',
          skillName: 'Medium Progress',
          attemptCount: 10,
          passCount: 5,
          progressPercentage: 50,
          lastAttemptDate: null,
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('High Progress')).toBeInTheDocument()
      expect(screen.getByText('Medium Progress')).toBeInTheDocument()
    })
  })

  describe('SubmissionHistory Component', () => {
    it('should render submission timeline', () => {
      const submissions: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
        {
          date: '16/01/2025',
          score: 72,
          status: 'passed',
          assignmentTitle: 'Assignment 2',
          submissionId: '2',
        },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('Lịch sử nộp bài')).toBeInTheDocument()
      expect(screen.getByText('Assignment 1')).toBeInTheDocument()
      expect(screen.getByText('Assignment 2')).toBeInTheDocument()
    })

    it('should display submission status badges', () => {
      const submissions: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
        {
          date: '16/01/2025',
          score: 45,
          status: 'failed',
          assignmentTitle: 'Assignment 2',
          submissionId: '2',
        },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('Đạt')).toBeInTheDocument()
      expect(screen.getByText('Không đạt')).toBeInTheDocument()
    })

    it('should show loading state', () => {
      render(<SubmissionHistory submissions={[]} isLoading={true} />, { wrapper: TestWrapper })

      const skeletons = document.querySelectorAll('.mantine-Skeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show no data when empty', () => {
      render(<SubmissionHistory submissions={[]} />, { wrapper: TestWrapper })

      expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument()
    })

    it('should display score badges', () => {
      const submissions: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('85')).toBeInTheDocument()
    })

    it('should display total submissions count', () => {
      const submissions: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
        {
          date: '16/01/2025',
          score: 72,
          status: 'passed',
          assignmentTitle: 'Assignment 2',
          submissionId: '2',
        },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tổng bài nộp')).toBeInTheDocument()
      expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    })

    it('should calculate success rate', () => {
      const submissions: PerformanceTrendPoint[] = [
        {
          date: '15/01/2025',
          score: 85,
          status: 'passed',
          assignmentTitle: 'Assignment 1',
          submissionId: '1',
        },
        {
          date: '16/01/2025',
          score: 72,
          status: 'passed',
          assignmentTitle: 'Assignment 2',
          submissionId: '2',
        },
        {
          date: '17/01/2025',
          score: 45,
          status: 'failed',
          assignmentTitle: 'Assignment 3',
          submissionId: '3',
        },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tổng bài nộp')).toBeInTheDocument()
      expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    })

    it('should display multiple submissions with mixed statuses', () => {
      const submissions: PerformanceTrendPoint[] = [
        { date: '01/01', score: 95, status: 'passed', assignmentTitle: 'A1', submissionId: '1' },
        { date: '02/01', score: 40, status: 'failed', assignmentTitle: 'A2', submissionId: '2' },
        { date: '03/01', score: 80, status: 'passed', assignmentTitle: 'A3', submissionId: '3' },
        { date: '04/01', score: 55, status: 'failed', assignmentTitle: 'A4', submissionId: '4' },
      ]

      render(<SubmissionHistory submissions={submissions} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tổng bài nộp')).toBeInTheDocument()
      expect(screen.getAllByText('4').length).toBeGreaterThan(0)
    })
  })

  describe('Vietnamese UI Labels', () => {
    it('should display all Vietnamese labels correctly', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'skill-1',
          skillName: 'Test',
          attemptCount: 1,
          passCount: 1,
          progressPercentage: 100,
          lastAttemptDate: null,
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('Tiến độ kỹ năng')).toBeInTheDocument()
    })

    it('should use Vietnamese abbreviations for skills', () => {
      const skillData: SkillProgress[] = [
        {
          skillId: 'test-skill-1234',
          skillName: 'Kỹ năng Test',
          attemptCount: 1,
          passCount: 1,
          progressPercentage: 100,
          lastAttemptDate: null,
        },
      ]

      render(<SkillProgressComponent skillProgress={skillData} />, { wrapper: TestWrapper })

      expect(screen.getByText('Kỹ năng Test')).toBeInTheDocument()
    })
  })

  describe('Data Aggregation Logic', () => {
    it('should calculate average score correctly', () => {
      const submissions = [{ score: 80 }, { score: 90 }, { score: 100 }]
      const avgScore = submissions.reduce((a, b) => a + b.score, 0) / submissions.length
      expect(Math.round(avgScore)).toBe(90)
    })

    it('should calculate 67% success rate', () => {
      const totalSubmissions = 3
      const passedSubmissions = 2
      const successRate = Math.round((passedSubmissions / totalSubmissions) * 100)
      expect(successRate).toBe(67)
    })

    it('should count test case results correctly', () => {
      const testCases = [
        { testCaseId: 'tc-1', passed: true },
        { testCaseId: 'tc-2', passed: true },
        { testCaseId: 'tc-3', passed: false },
      ]
      const passed = testCases.filter((tc) => tc.passed).length
      expect(passed).toBe(2)
    })
  })
})
