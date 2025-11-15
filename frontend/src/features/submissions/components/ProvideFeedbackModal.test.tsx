/**
 * Test Suite: ProvideFeedbackModal Component
 * Tests for feedback submission functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ProvideFeedbackModal } from './ProvideFeedbackModal'

vi.mock('../api/useInstructorSubmissions', () => ({
  useInstructorSubmissionDetail: vi.fn(() => ({
    data: {
      id: 'sub-123',
      studentId: 'std-456',
      score: 85,
      assignmentId: 'assign-789',
      content: 'console.log("hello");',
      language: 'javascript',
      submittedAt: '2024-01-15T10:00:00Z',
      status: 'EVALUATED',
    },
    isLoading: false,
    error: null,
  })),
  useProvideFeedback: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  })),
}))

describe('ProvideFeedbackModal', () => {
  const defaultProps = {
    isOpen: true,
    submissionId: 'sub-123',
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(<ProvideFeedbackModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Cung cấp phản hồi')).not.toBeInTheDocument()
  })

  it('should render modal when isOpen is true', () => {
    render(<ProvideFeedbackModal {...defaultProps} />)
    expect(screen.getByText('Cung cấp phản hồi')).toBeInTheDocument()
  })

  it('should display submission info', async () => {
    render(<ProvideFeedbackModal {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText(/Sinh viên ID/)).toBeInTheDocument()
    })
  })

  it('should disable submit when feedback is empty', () => {
    render(<ProvideFeedbackModal {...defaultProps} />)
    const submitBtn = screen.getByRole('button', { name: /Gửi phản hồi/i })
    expect(submitBtn).toBeDisabled()
  })

  it('should enable submit with valid feedback', async () => {
    const user = userEvent.setup()
    render(<ProvideFeedbackModal {...defaultProps} />)
    const textarea = screen.getByRole('textbox', { name: /Phản hồi chi tiết/i })
    await user.type(textarea, 'Valid feedback message here')
    const submitBtn = screen.getByRole('button', { name: /Gửi phản hồi/i })
    expect(submitBtn).not.toBeDisabled()
  })

  it('should update textarea on typing', async () => {
    const user = userEvent.setup()
    render(<ProvideFeedbackModal {...defaultProps} />)
    const textarea = screen.getByRole('textbox', { name: /Phản hồi chi tiết/i })
    await user.type(textarea, 'Test feedback')
    expect(textarea).toHaveValue('Test feedback')
  })

  it('should call onClose when cancel is clicked', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()
    render(<ProvideFeedbackModal {...defaultProps} onClose={mockOnClose} />)
    const cancelBtn = screen.getByRole('button', { name: /Hủy/i })
    await user.click(cancelBtn)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should show character count', async () => {
    const user = userEvent.setup()
    render(<ProvideFeedbackModal {...defaultProps} />)
    const textarea = screen.getByRole('textbox', { name: /Phản hồi chi tiết/i })
    await user.type(textarea, 'Test')
    expect(screen.getByText(/\/5000/)).toBeInTheDocument()
  })

  it('should have Vietnamese labels', () => {
    render(<ProvideFeedbackModal {...defaultProps} />)
    expect(screen.getByText(/Cung cấp phản hồi/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hủy/i })).toBeInTheDocument()
  })
})
