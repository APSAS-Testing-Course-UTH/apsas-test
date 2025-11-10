/**
 * ScoreDistributionChart Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { ScoreDistributionChart } from './ScoreDistributionChart'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

describe('ScoreDistributionChart', () => {
  const mockSubmissions: SubmissionServiceSubmissionResponse[] = [
    { id: '1', score: 95, status: 'SUBMITTED', submittedAt: '2024-01-01' } as any,
    { id: '2', score: 88, status: 'SUBMITTED', submittedAt: '2024-01-02' } as any,
    { id: '3', score: 75, status: 'SUBMITTED', submittedAt: '2024-01-03' } as any,
    { id: '4', score: 62, status: 'SUBMITTED', submittedAt: '2024-01-04' } as any,
    { id: '5', score: 45, status: 'SUBMITTED', submittedAt: '2024-01-05' } as any,
  ]

  it('should render loading skeleton when isLoading is true', () => {
    render(<ScoreDistributionChart isLoading={true} />)
    const skeletons = document.querySelectorAll('.mantine-Skeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should display empty message when no submissions provided', () => {
    render(<ScoreDistributionChart submissions={[]} isEmpty={true} />)
    expect(screen.getByText('Không có dữ liệu điểm số')).toBeInTheDocument()
  })

  it('should display empty message when isEmpty flag is true', () => {
    render(<ScoreDistributionChart isEmpty={true} />)
    expect(screen.getByText('Không có dữ liệu điểm số')).toBeInTheDocument()
  })

  it('should show chart title when data is available', async () => {
    render(
      <ScoreDistributionChart
        submissions={mockSubmissions}
        isLoading={false}
        isEmpty={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Phân Bố Điểm Số')).toBeInTheDocument()
    })
  })

  it('should display footer with Vietnamese label and submission count', async () => {
    render(
      <ScoreDistributionChart
        submissions={mockSubmissions}
        isLoading={false}
        isEmpty={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Tổng cộng.*5.*bài nộp/)).toBeInTheDocument()
    })
  })
})
