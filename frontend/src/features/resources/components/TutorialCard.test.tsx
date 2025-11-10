import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { TutorialCard } from './TutorialCard'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

const mockTutorial: ContentServiceTutorialResponse = {
  id: 'tutorial-1',
  title: 'Hướng dẫn React Hooks',
  content: 'Hướng dẫn chi tiết về cách sử dụng React Hooks trong ứng dụng của bạn',
  tags: ['react', 'hooks', 'javascript'],
  createdAt: '2024-01-15T10:30:00Z',
}

const mockTutorialWithLongTitle: ContentServiceTutorialResponse = {
  ...mockTutorial,
  title: 'Hướng dẫn React Hooks - Phần 1: Giới thiệu cơ bản và sử dụng useState',
}

const mockTutorialWithLongContent: ContentServiceTutorialResponse = {
  ...mockTutorial,
  content: 'Đây là một hướng dẫn rất dài và chi tiết về React Hooks bao gồm nhiều phần khác nhau như useState, useEffect, useContext và nhiều hooks khác nữa',
}

const mockTutorialWithManyTags: ContentServiceTutorialResponse = {
  ...mockTutorial,
  tags: ['react', 'hooks', 'javascript', 'frontend', 'advanced', 'performance'],
}

const mockTutorialWithoutTags: ContentServiceTutorialResponse = {
  ...mockTutorial,
  tags: undefined,
}

describe('TutorialCard', () => {
  it('should render tutorial card with title and content', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('Hướng dẫn React Hooks')).toBeInTheDocument()
    expect(
      screen.getByText(/Hướng dẫn chi tiết về cách sử dụng React Hooks/)
    ).toBeInTheDocument()
  })

  it('should display creation date in Vietnamese format', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText(/Tạo ngày: 15\/01\/2024/)).toBeInTheDocument()
  })

  it('should display tags as badges', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('hooks')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('should show tag count badge when more than 3 tags', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorialWithManyTags}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('should not render tags section if tags are empty', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorialWithoutTags}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.queryByText('react')).not.toBeInTheDocument()
  })

  it('should call onViewDetails when card is clicked', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết hướng dẫn: Hướng dẫn React Hooks/,
    })
    fireEvent.click(card)

    expect(onViewDetails).toHaveBeenCalledWith(mockTutorial)
    expect(onViewDetails).toHaveBeenCalledTimes(1)
  })

  it('should call onViewDetails on keyboard Enter key', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết hướng dẫn: Hướng dẫn React Hooks/,
    })
    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onViewDetails).toHaveBeenCalledWith(mockTutorial)
  })

  it('should call onViewDetails on keyboard Space key', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết hướng dẫn: Hướng dẫn React Hooks/,
    })
    fireEvent.keyDown(card, { key: ' ' })

    expect(onViewDetails).toHaveBeenCalledWith(mockTutorial)
  })

  it('should display download button when onDownload is provided', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    expect(screen.getByRole('button', { name: /Tải xuống/ })).toBeInTheDocument()
  })

  it('should not display download button when onDownload is not provided', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.queryByRole('button', { name: /Tải xuống/ })).not.toBeInTheDocument()
  })

  it('should call onDownload when download button is clicked', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/ })
    fireEvent.click(downloadBtn)

    expect(onDownload).toHaveBeenCalledWith(mockTutorial)
    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('should not call onViewDetails when download button is clicked', () => {
    const onViewDetails = vi.fn()
    const onDownload = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/ })
    fireEvent.click(downloadBtn)

    expect(onViewDetails).not.toHaveBeenCalled()
  })

  it('should truncate long title to 2 lines', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorialWithLongTitle}
        onViewDetails={onViewDetails}
      />
    )

    const title = screen.getByText(/Hướng dẫn React Hooks/)
    expect(title).toBeInTheDocument()
    // Mantine lineClamp(2) should apply truncation
    expect(title).toHaveStyle({ overflow: 'hidden' })
  })

  it('should truncate long content to 2 lines', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorialWithLongContent}
        onViewDetails={onViewDetails}
      />
    )

    const content = screen.getByText(/Đây là một hướng dẫn rất dài/)
    expect(content).toBeInTheDocument()
    // Mantine lineClamp(2) should apply truncation
    expect(content).toHaveStyle({ overflow: 'hidden' })
  })

  it('should handle missing tutorial fields gracefully', () => {
    const onViewDetails = vi.fn()
    const emptyTutorial: ContentServiceTutorialResponse = {
      id: 'tutorial-2',
    }
    render(
      <TutorialCard
        tutorial={emptyTutorial}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('Không có tiêu đề')).toBeInTheDocument()
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('should handle missing createdAt field', () => {
    const onViewDetails = vi.fn()
    const tutorialWithoutDate: ContentServiceTutorialResponse = {
      ...mockTutorial,
      createdAt: undefined,
    }
    render(
      <TutorialCard
        tutorial={tutorialWithoutDate}
        onViewDetails={onViewDetails}
      />
    )

    expect(screen.getByText('Tạo ngày: N/A')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    const onViewDetails = vi.fn()
    render(
      <TutorialCard
        tutorial={mockTutorial}
        onViewDetails={onViewDetails}
      />
    )

    const card = screen.getByRole('button', {
      name: /Xem chi tiết hướng dẫn: Hướng dẫn React Hooks/,
    })
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('aria-label')
  })
})
