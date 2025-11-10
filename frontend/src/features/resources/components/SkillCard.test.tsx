import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { SkillCard } from './SkillCard'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

describe('SkillCard', () => {
  const mockSkill: ContentServiceSkillResponse = {
    id: 'skill-1',
    name: 'React Hooks',
    description: 'Learn how to use React Hooks effectively in your applications',
    createdAt: '2025-01-01T10:30:00Z',
  }

  const mockSkillWithLongName: ContentServiceSkillResponse = {
    ...mockSkill,
    name: 'Advanced React Hooks Patterns - Complete Guide to UseState UseEffect UseContext and More',
  }

  const mockSkillWithoutDescription: ContentServiceSkillResponse = {
    ...mockSkill,
    description: undefined,
  }

  it('should render skill card with name and description', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('React Hooks')).toBeInTheDocument()
    expect(screen.getByText(/Learn how to use React Hooks/)).toBeInTheDocument()
  })

  it('should display creation date in Vietnamese format', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText(/Tạo ngày: 01\/01\/2025/)).toBeInTheDocument()
  })

  it('should call onViewDetails when card is clicked', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết kỹ năng: React Hooks/,
    })
    fireEvent.click(card)

    expect(onViewDetails).toHaveBeenCalledWith(mockSkill)
    expect(onViewDetails).toHaveBeenCalledTimes(1)
  })

  it('should call onViewDetails on keyboard Enter key', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết kỹ năng: React Hooks/,
    })
    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onViewDetails).toHaveBeenCalledWith(mockSkill)
  })

  it('should call onViewDetails on keyboard Space key', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết kỹ năng: React Hooks/,
    })
    fireEvent.keyDown(card, { key: ' ' })

    expect(onViewDetails).toHaveBeenCalledWith(mockSkill)
  })

  it('should display download button when onDownload is provided', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    expect(screen.getByRole('button', { name: /Tải xuống/ })).toBeInTheDocument()
  })

  it('should not display download button when onDownload is not provided', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.queryByRole('button', { name: /Tải xuống/ })).not.toBeInTheDocument()
  })

  it('should call onDownload when download button is clicked', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/ })
    fireEvent.click(downloadBtn)

    expect(onDownload).toHaveBeenCalledWith(mockSkill)
    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('should not call onViewDetails when download button is clicked', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/ })
    fireEvent.click(downloadBtn)

    expect(onViewDetails).not.toHaveBeenCalled()
  })

  it('should truncate long name to 2 lines', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkillWithLongName}
        onViewDetails={onViewDetails}
      />
    )

    const name = screen.getByText(/Advanced React Hooks/)
    expect(name).toBeInTheDocument()
    expect(name).toHaveStyle({ overflow: 'hidden' })
  })

  it('should handle missing description gracefully', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkillWithoutDescription}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    const onViewDetails = vi.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết kỹ năng: React Hooks/,
    })
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('aria-label')
  })
})
