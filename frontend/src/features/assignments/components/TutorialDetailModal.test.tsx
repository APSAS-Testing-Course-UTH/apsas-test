import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { TutorialDetailModal } from './TutorialDetailModal'

vi.mock('../api/useTutorialDetail', () => ({
  useTutorialDetail: vi.fn(),
}))

import { useTutorialDetail } from '../api/useTutorialDetail'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

const mockTutorial: ContentServiceTutorialResponse = {
  id: 'tutorial-1',
  title: 'React Hooks Tutorial',
  content: '# React Hooks\n\nLearn about useState.',
  creatorId: 'creator-1',
  createdAt: new Date('2024-01-15'),
  tags: ['React', 'Hooks'],
}

const renderModal = (
  tutorialId = 'tutorial-1',
  opened = true,
  onClose = vi.fn()
) => {
  return render(
    <TutorialDetailModal
      tutorialId={tutorialId}
      opened={opened}
      onClose={onClose}
    />
  )
}

describe('TutorialDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when opened is false', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: mockTutorial,
      isLoading: false,
      error: null,
    })

    const { container } = renderModal('tutorial-1', false)
    const modal = container.querySelector('[role="dialog"]')
    expect(modal).not.toBeInTheDocument()
  })

  it('should render modal with title when opened is true', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: mockTutorial,
      isLoading: false,
      error: null,
    })

    renderModal()
    expect(screen.getByText('Chi tiết Tài liệu')).toBeInTheDocument()
  })

  it('should display loading spinner when data is loading', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderModal()
    expect(screen.getByText(/Đang tải tài liệu/i)).toBeInTheDocument()
  })

  it('should display error alert when fetch fails', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed'),
    })

    renderModal()
    expect(screen.getByText(/Lỗi khi tải tài liệu/i)).toBeInTheDocument()
  })

  it('should display not found message when no tutorial', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderModal()
    expect(screen.getByText(/Không tìm thấy tài liệu/i)).toBeInTheDocument()
  })

  it('should display tutorial title and content', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: mockTutorial,
      isLoading: false,
      error: null,
    })

    renderModal()
    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument()
  })

  it('should display tutorial metadata and tags', () => {
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: mockTutorial,
      isLoading: false,
      error: null,
    })

    renderModal()
    expect(screen.getByText(/creator-1/)).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn()
    const mockHook = useTutorialDetail as any
    mockHook.mockReturnValue({
      data: mockTutorial,
      isLoading: false,
      error: null,
    })

    renderModal('tutorial-1', true, onClose)
    // Get the modal close button (first Đóng button in modal header, not the one in content)
    const allCloseButtons = screen.getAllByRole('button', { name: /Đóng/i })
    const modalCloseButton = allCloseButtons[0] // The modal header close button
    fireEvent.click(modalCloseButton)
    expect(onClose).toHaveBeenCalled()
  })
})
