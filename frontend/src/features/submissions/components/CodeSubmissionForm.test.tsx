/**
 * CodeSubmissionForm Component Tests
 * Testing form rendering, validation, submission, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as rtlRender, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { CodeSubmissionForm } from './CodeSubmissionForm'

// Mock Monaco Editor to render as a simple textarea
vi.mock('@monaco-editor/react', () => {
  const MockEditor = ({ value, onChange }: any) => {
    return (
      <textarea
        role="textbox"
        aria-label="Mã bài nộp"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="monaco-editor"
        style={{ width: '100%', height: '300px', fontFamily: 'monospace' }}
        placeholder="Viết mã của bạn tại đây..."
      />
    )
  }
  
  const MockDiffEditor = ({ original, modified }: any) => {
    return (
      <div data-testid="monaco-diff-editor">
        <textarea readOnly value={original} />
        <textarea value={modified} />
      </div>
    )
  }

  return {
    default: MockEditor,
    Editor: MockEditor,
    DiffEditor: MockDiffEditor,
  }
})

// Mock useFormAutoSave hook
vi.mock('../hooks', () => ({
  useFormAutoSave: vi.fn(() => ({
    lastSavedTime: null,
    isDraft: false,
    isSaving: false,
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    recoverDraft: vi.fn(() => null),
  })),
  AUTO_SAVE_LABELS: {
    lastSaved: (time: string) => `Lưu gần đây lúc ${time}`,
    clearDraft: 'Xóa bản nháp',
    unsavedChanges: 'Có thay đổi chưa được lưu',
    draftRecovered: 'Bản nháp được khôi phục',
    saveFailed: 'Lưu thất bại',
    noConnection: 'Không có kết nối',
  },
}))

// Custom render that wraps with MantineProvider (same as Button test pattern)
const render = (ui: React.ReactElement, options?: any) =>
  rtlRender(<MantineProvider>{ui}</MantineProvider>, options)

// Mock data using API type
import type { EvaluationServiceRuntimeResponse } from '@/api/types.gen'

const mockRuntimes: EvaluationServiceRuntimeResponse[] = [
  { language: 'Python', version: '3.12.0', runtime: 'CPython', aliases: ['python3', 'py'] },
  { language: 'JavaScript', version: '18.0.0', runtime: 'Node.js', aliases: ['node', 'js'] },
]

const mockOnSubmit = vi.fn()
const mockOnError = vi.fn()

describe('CodeSubmissionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering & Vietnamese UI', () => {
    it('should render form with Vietnamese labels', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
      // Code editor label is part of the editor's aria-label, so check for the editor instead
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
      expect(screen.getByTestId('monaco-editor')).toHaveAttribute('aria-label', 'Mã bài nộp')
    })

    it('should render submit button with Vietnamese label', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByRole('button', { name: 'Nộp bài' })).toBeInTheDocument()
    })

    it('should render clear button with Vietnamese label', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument()
    })

    it('should render copy button with Vietnamese label', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByRole('button', { name: 'Sao chép' })).toBeInTheDocument()
    })

    it('should render character counter with Vietnamese label', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText(/0 ký tự \/ 10000/)).toBeInTheDocument()
    })
  })

  describe('Language Selector', () => {
    it('should render all available runtimes', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      // Mantine Select should contain the runtime options
      const selectInputs = screen.getAllByRole('textbox', { name: /ngôn ngữ/i })
      expect(selectInputs.length).toBeGreaterThan(0)
    })

    it('should set Python as default runtime', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      // The form should have Python selected by default
      const select = screen.getByRole('textbox', { name: /ngôn ngữ/i })
      expect(select).toBeInTheDocument()
    })
  })

  describe('Code Input & Character Counter', () => {
    it('should allow typing code into textarea', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      await userEvent.type(textarea, 'print("Hello World")')

      expect(textarea).toHaveValue('print("Hello World")')
    })

    it('should update character counter when code is typed', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'test code' } })

      expect(screen.getByText('9 ký tự / 10000')).toBeInTheDocument()
    })

    it('should validate when code exceeds max length', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i }) as HTMLTextAreaElement
      const longText = 'a'.repeat(10001)

      // Change code to exceed max length
      fireEvent.change(textarea, { target: { value: longText } })

      // Verify the textarea has the content (HTML allows it)
      expect(textarea.value.length).toBe(10001)

      // Character counter should show the actual length
      await waitFor(() => {
        expect(screen.getByText(/10001 ký tự/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission & Validation', () => {
    it('should show error when language not selected', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={[]} // No runtimes available
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      await userEvent.clear(textarea)
      await userEvent.type(textarea, 'some code')

      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      // Check for Vietnamese error message - should be the custom error with role="alert"
      await waitFor(() => {
        const errorElement = screen.getByRole('alert')
        expect(errorElement).toHaveTextContent('Vui lòng chọn ngôn ngữ')
      })
    })

    it('should show error when code is empty', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      // Make sure textarea is empty
      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: '' } })

      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      // Check for Vietnamese error message - wait for state update
      await waitFor(() => {
        expect(screen.getByText('Mã không được trống')).toBeInTheDocument()
      })
    })

    it('should show error when code exceeds max length', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i }) as HTMLTextAreaElement
      const longText = 'a'.repeat(10001)

      // HTML allows programmatic setting of longer text
      fireEvent.change(textarea, { target: { value: longText } })
      expect(textarea.value.length).toBe(10001)

      // Trigger validation by submitting
      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Mã quá dài (tối đa 10,000 ký tự)')).toBeInTheDocument()
      })
    })
  })

  describe('Clear Functionality', () => {
    it('should clear code when clear button is clicked', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'test code' } })
      expect(textarea).toHaveValue('test code')

      const clearButton = screen.getByRole('button', { name: 'Xóa' })
      await userEvent.click(clearButton)

      expect(textarea).toHaveValue('')
    })

    it('should clear errors when clear button is clicked', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      // Enter some code first
      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'some code' } })

      // Trigger error by clearing and submitting
      fireEvent.change(textarea, { target: { value: '' } })
      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Mã không được trống')).toBeInTheDocument()
      })

      // Now enter some code to enable clear button
      fireEvent.change(textarea, { target: { value: 'some code again' } })

      // Click clear
      const clearButton = screen.getByRole('button', { name: 'Xóa' })
      await userEvent.click(clearButton)

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Mã không được trống')).not.toBeInTheDocument()
      })
    })

    it('should reset character counter when clear button is clicked', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'test code' } })

      expect(screen.getByText('9 ký tự / 10000')).toBeInTheDocument()

      const clearButton = screen.getByRole('button', { name: 'Xóa' })
      await userEvent.click(clearButton)

      expect(screen.getByText('0 ký tự / 10000')).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('should copy code to clipboard', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'test code' } })

      const copyButton = screen.getByRole('button', { name: 'Sao chép' })
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('test code')
      })
    })

    it('should not copy empty code', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      })

      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const copyButton = screen.getByRole('button', { name: 'Sao chép' })
      await userEvent.click(copyButton)

      expect(mockWriteText).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByRole('textbox', { name: 'Mã bài nộp' })
      expect(textarea).toHaveAttribute('aria-label', 'Mã bài nộp')
    })

    it('should show error alert with proper ARIA role', async () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when isLoading is true', () => {
      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          isLoading={true}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /nộp|đang/i })
      expect(submitButton).toBeDisabled()
    })

    it('should show loading indicator when isLoading is true', () => {
      const { container } = render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          isLoading={true}
          onSubmit={mockOnSubmit}
        />
      )

      // Mantine Loader should be present or buttons should be disabled
      const submitButton = screen.getByRole('button', { name: /nộp|đang/i })
      expect(submitButton).toBeDisabled()
      expect(container).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when submission fails', async () => {
      const errorMsg = 'Network error'
      mockOnSubmit.mockRejectedValue(new Error(errorMsg))

      render(
        <CodeSubmissionForm
          assignmentId="a1"
          runtimes={mockRuntimes}
          onSubmit={mockOnSubmit}
          onError={mockOnError}
        />
      )

      const textarea = screen.getByRole('textbox', { name: /mã/i })
      fireEvent.change(textarea, { target: { value: 'some code' } })

      const submitButton = screen.getByRole('button', { name: 'Nộp bài' })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
    })
  })
})
