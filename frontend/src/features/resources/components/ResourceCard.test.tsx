import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { ResourceCard } from './ResourceCard'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

const mockResource: ContentServiceTutorialResponse = {
  id: 'tutorial-1',
  title: 'React Hooks Advanced Patterns',
  content: `# React Hooks

## useState Hook
Quản lý state trong functional components.

## useEffect Hook
Xử lý side effects.`,
  tags: ['react', 'hooks', 'javascript'],
  createdAt: '2025-01-15T10:30:00Z',
}

describe('ResourceCard with TutorialDetailModal Integration', () => {
  it('should render resource card', () => {
    render(
      <ResourceCard
        resource={mockResource}
      />
    )

    expect(screen.getByText('React Hooks Advanced Patterns')).toBeInTheDocument()
    expect(screen.getByText(/React Hooks/)).toBeInTheDocument()
  })

  it('should open TutorialDetailModal when card clicked', async () => {
    render(
      <ResourceCard
        resource={mockResource}
      />
    )

    const card = screen.getByText('React Hooks Advanced Patterns').closest('div[style*="cursor"]')
    if (card) {
      fireEvent.click(card)
    }

    // Modal should open with loading state initially
    await waitFor(() => {
      const titleText = screen.queryByText(/Hướng dẫn lập trình|Đang tải/)
      expect(titleText).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('should display download button', () => {
    const onDownload = vi.fn()
    render(
      <ResourceCard
        resource={mockResource}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/i })
    expect(downloadBtn).toBeInTheDocument()
  })

  it('should call onDownload when download button clicked', () => {
    const onDownload = vi.fn()
    render(
      <ResourceCard
        resource={mockResource}
        onDownload={onDownload}
      />
    )

    const downloadBtn = screen.getByRole('button', { name: /Tải xuống/i })
    fireEvent.click(downloadBtn)

    expect(onDownload).toHaveBeenCalledWith(mockResource)
  })

  it('should display tags', () => {
    render(
      <ResourceCard
        resource={mockResource}
      />
    )

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('hooks')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('should display creation date in Vietnamese format', () => {
    render(
      <ResourceCard
        resource={mockResource}
      />
    )

    expect(screen.getByText(/Tạo: 15\/01\/2025/)).toBeInTheDocument()
  })

  it('should handle missing content gracefully', () => {
    const resourceWithoutContent: ContentServiceTutorialResponse = {
      id: 'tutorial-2',
      title: 'Test Tutorial',
    }

    render(
      <ResourceCard
        resource={resourceWithoutContent}
      />
    )

    expect(screen.getByText('Test Tutorial')).toBeInTheDocument()
    expect(screen.getByText('Không có mô tả')).toBeInTheDocument()
  })

  it('should display "Hướng dẫn" badge', () => {
    render(
      <ResourceCard
        resource={mockResource}
      />
    )

    expect(screen.getByText('Hướng dẫn')).toBeInTheDocument()
  })
})
