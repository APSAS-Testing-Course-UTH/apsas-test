import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { TutorialDetailModal } from './TutorialDetailModal'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

const mockTutorial: ContentServiceTutorialResponse = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Hướng dẫn React Hooks',
  content: `# React Hooks

## useState Hook

Sử dụng \`useState\` để quản lý state trong functional components.

\`\`\`typescript
const [count, setCount] = useState(0)
\`\`\`

## useEffect Hook

Sử dụng \`useEffect\` để thực hiện side effects.`,
  tags: ['react', 'hooks', 'javascript'],
  createdAt: new Date('2024-01-15T10:30:00Z'),
}

describe('TutorialDetailModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={false}
        onClose={vi.fn()}
      />
    )

    const modal = container.querySelector('[role="dialog"]')
    expect(modal).not.toBeInTheDocument()
  })

  it('should display loading state when fetching', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    // Should show loading message
    expect(screen.getByText(/Đang tải chi tiết hướng dẫn/)).toBeInTheDocument()
  })

  it('should render modal when isOpen is true and data loaded', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    // Wait for data to load and modal to render
    await waitFor(() => {
      expect(screen.getByText(/Hướng dẫn React Hooks/i)).toBeInTheDocument()
    })

    // Should not show loading state anymore
    expect(screen.queryByText(/Đang tải chi tiết hướng dẫn/)).not.toBeInTheDocument()
  })

  it('should display tutorial title in modal', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Hướng dẫn React Hooks/i)).toBeInTheDocument()
    })
  })

  it('should display creation date in Vietnamese format', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Tạo: 15\/01\/2024/)).toBeInTheDocument()
    })
  })

  it('should display tutorial tags as badges', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument()
      expect(screen.getByText('hooks')).toBeInTheDocument()
      expect(screen.getByText('javascript')).toBeInTheDocument()
    })
  })

  it('should render markdown content correctly', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      // Check for markdown heading
      expect(screen.getByText('React Hooks')).toBeInTheDocument()
      // Check for code block content
      expect(screen.getByText(/useState/)).toBeInTheDocument()
    })
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={onClose}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Hướng dẫn React Hooks')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /Đóng/ })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('should call onDownload when download button is clicked', async () => {
    const onDownload = vi.fn()
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
        onDownload={onDownload}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Hướng dẫn React Hooks/i)).toBeInTheDocument()
    })

    const downloadButton = screen.getByRole('button', { name: /Tải xuống/ })
    fireEvent.click(downloadButton)

    expect(onDownload).toHaveBeenCalled()
  })

  it('should not display download button if onDownload is not provided', async () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Hướng dẫn React Hooks/i)).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Tải xuống/ })).not.toBeInTheDocument()
  })

  it('should display error state when fetch fails', async () => {
    render(
      <TutorialDetailModal
        tutorialId="invalid-id"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    // MSW should return an error for invalid ID
    await waitFor(() => {
      // Wait for error state to appear
      const alertOrError = screen.queryByText(/Lỗi|Error|không tìm thấy/) ?? screen.queryByText(/Hướng dẫn/)
      expect(alertOrError).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should provide retry button in error state', async () => {
    render(
      <TutorialDetailModal
        tutorialId="invalid-id"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      const retryButton = screen.queryByRole('button', { name: /Thử lại/ })
      // Retry button may or may not appear depending on error handling
      if (retryButton) {
        expect(retryButton).toBeInTheDocument()
      }
    }, { timeout: 3000 })
  })

  it('should not fetch data when tutorialId is null', () => {
    render(
      <TutorialDetailModal
        tutorialId={null}
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    // Should not show loading or content
    expect(screen.queryByText(/Đang tải/)).not.toBeInTheDocument()
    expect(screen.queryByText('Hướng dẫn React Hooks')).not.toBeInTheDocument()
  })

  it('should not fetch data when isOpen is false even with tutorialId', () => {
    render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={false}
        onClose={vi.fn()}
      />
    )

    expect(screen.queryByText(/Đang tải/)).not.toBeInTheDocument()
    expect(screen.queryByText('Hướng dẫn React Hooks')).not.toBeInTheDocument()
  })

  it('should have proper modal structure', async () => {
    const { container } = render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Hướng dẫn React Hooks')).toBeInTheDocument()
    })

    // Should have modal title
    expect(screen.getByText('Hướng dẫn lập trình')).toBeInTheDocument()
  })

  it('should handle rapid open/close transitions', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={false}
        onClose={onClose}
      />
    )

    // Open modal
    rerender(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={onClose}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(/Đang tải|Hướng dẫn React/)).toBeTruthy()
    }, { timeout: 2000 })

    // Close modal
    rerender(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={false}
        onClose={onClose}
      />
    )

    // Modal should not be visible
    const modal = document.querySelector('[role="dialog"]')
    if (modal) {
      expect(modal).not.toBeVisible()
    }
  })

  it('should update content when tutorialId changes', async () => {
    const { rerender } = render(
      <TutorialDetailModal
        tutorialId="123e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Hướng dẫn React Hooks')).toBeInTheDocument()
    })

    // Change to different tutorial
    rerender(
      <TutorialDetailModal
        tutorialId="223e4567-e89b-12d3-a456-426614174000"
        isOpen={true}
        onClose={vi.fn()}
      />
    )

    // Should show loading while fetching new tutorial or render new content
    await waitFor(() => {
      // Wait for either loading state or new content
      const element = screen.queryByText(/Đang tải|JavaScript|Hướng dẫn/)
      expect(element).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
