/**
 * SkillsMasteryChart Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { SkillsMasteryChart } from './SkillsMasteryChart'
import type { SkillProgress } from '../types'

describe('SkillsMasteryChart', () => {
  const mockSkillsProgress: SkillProgress[] = [
    {
      skillId: '1',
      skillName: 'Python',
      progressPercentage: 85,
      lastAttemptDate: '2024-01-15',
      attemptCount: 5,
    },
    {
      skillId: '2',
      skillName: 'JavaScript',
      progressPercentage: 72,
      lastAttemptDate: '2024-01-14',
      attemptCount: 4,
    },
    {
      skillId: '3',
      skillName: 'TypeScript',
      progressPercentage: 68,
      lastAttemptDate: '2024-01-13',
      attemptCount: 3,
    },
    {
      skillId: '4',
      skillName: 'React',
      progressPercentage: 90,
      lastAttemptDate: '2024-01-12',
      attemptCount: 6,
    },
  ]

  it('should render loading skeleton when isLoading is true', () => {
    render(<SkillsMasteryChart isLoading={true} />)
    const skeletons = document.querySelectorAll('.mantine-Skeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should display empty message when no skills provided', () => {
    render(<SkillsMasteryChart skillsProgress={[]} isEmpty={true} />)
    expect(screen.getByText('Chưa thử bất kỳ kỹ năng nào')).toBeInTheDocument()
  })

  it('should display empty message when isEmpty flag is true', () => {
    render(<SkillsMasteryChart isEmpty={true} />)
    expect(screen.getByText('Chưa thử bất kỳ kỹ năng nào')).toBeInTheDocument()
  })

  it('should render chart title when skills data is available', async () => {
    render(
      <SkillsMasteryChart
        skillsProgress={mockSkillsProgress}
        isLoading={false}
        isEmpty={false}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Thành Thạo Kỹ Năng')).toBeInTheDocument()
    })
  })

  it('should display responsive container for radar chart', async () => {
    render(
      <SkillsMasteryChart
        skillsProgress={mockSkillsProgress}
        isLoading={false}
        isEmpty={false}
      />
    )

    await waitFor(() => {
      const container = document.querySelector('.recharts-responsive-container')
      expect(container).toBeInTheDocument()
    })
  })

  it('should display footer with Vietnamese update text', async () => {
    render(
      <SkillsMasteryChart
        skillsProgress={mockSkillsProgress}
        isLoading={false}
        isEmpty={false}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByText('Được cập nhật lần cuối từ lần nộp gần nhất')
      ).toBeInTheDocument()
    })
  })
})
