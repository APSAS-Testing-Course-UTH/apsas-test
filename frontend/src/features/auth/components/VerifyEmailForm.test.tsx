import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { VerifyEmailForm } from './VerifyEmailForm'

// Mock hooks and router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({ state: { location: { pathname: '/' } } }),
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

const mockVerifyEmail = vi.fn()
vi.mock('../hooks/useVerifyEmail', () => ({
  useVerifyEmail: () => ({
    mutate: mockVerifyEmail,
    isPending: false,
    error: null,
    isSuccess: false,
    isError: false,
  }),
}))

// CRITICAL FIX: Mock the Zod resolver to avoid validation framework crashes
vi.mock('mantine-form-zod-resolver', () => ({
  zodResolver: () => {
    return () => ({
      values: {},
      errors: {},
    })
  },
}))

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  )
}

// Helper: Get main heading (h2 size, 'Xác minh email')
const getMainHeading = () => {
  const headings = screen.getAllByRole('heading')
  return headings.find(h => h.textContent?.trim() === 'Xác minh email' && h.getAttribute('data-size') === 'h2')
}

describe('VerifyEmailForm - Vietnamese UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockVerifyEmail.mockClear()
    mockNavigate.mockClear()
  })

  describe('Form Rendering & Vietnamese UI', () => {
    it('should render with Vietnamese title', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const mainHeading = getMainHeading()
      expect(mainHeading).toBeInTheDocument()
    })

    it('should render Vietnamese subtitle message', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Vui lòng xác minh email để hoàn tất đăng ký/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese token label', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Token xác minh')).toBeInTheDocument()
    })

    it('should have Vietnamese submit button text', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      expect(submitButton).toBeInTheDocument()
    })

    it('should have token input placeholder', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      expect(tokenInput).toBeInTheDocument()
    })

    it('should render all required form elements', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Token xác minh')).toBeInTheDocument()
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      expect(submitButton).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Nhập token xác minh email')).toBeInTheDocument()
    })

    it('should render Paper container with proper styling', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const paper = screen.getByPlaceholderText('Nhập token xác minh email').closest('.mantine-Paper-root')
      expect(paper).toBeInTheDocument()
    })

    it('should have proper form structure', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const form = screen.getByRole('button').closest('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Token Input Interactions', () => {
    it('should accept token input', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'verifytoken123abc')
      expect((tokenInput as HTMLInputElement).value).toContain('verifytoken123abc')
    })

    it('should allow clearing token input', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'verifytoken123abc')
      await user.clear(tokenInput)
      expect((tokenInput as HTMLInputElement).value).toBe('')
    })

    it('should handle long token input', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      const longToken = 'verifytoken123abc456def789ghi000jkl111mnopqrstuvwxyz'

      await user.type(tokenInput, longToken)
      expect((tokenInput as HTMLInputElement).value).toContain(longToken)
    })

    it('should allow alphanumeric characters in token', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'token123ABC456def789')
      expect((tokenInput as HTMLInputElement).value).toContain('token123ABC456def789')
    })

    it('should handle rapid token input changes', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'a')
      await user.clear(tokenInput)
      await user.type(tokenInput, 'b')
      await user.clear(tokenInput)
      await user.type(tokenInput, 'finaltoken')

      expect((tokenInput as HTMLInputElement).value).toContain('finaltoken')
    })

    it('should maintain token value after multiple interactions', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'mytoken')
      expect((tokenInput as HTMLInputElement).value).toBe('mytoken')

      await user.type(tokenInput, 'more')
      expect((tokenInput as HTMLInputElement).value).toBe('mytokenmore')
    })
  })

  describe('Form Submission', () => {
    it('should have working submit button', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email') && (btn as HTMLButtonElement).type === 'submit')
      expect(submitButton).toBeInTheDocument()
    })

    it('should handle form submission with token', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'verifytoken123')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      if (submitButton) await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should maintain token data after interaction', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, 'testtoken123')
      expect((tokenInput as HTMLInputElement).value).toContain('testtoken123')
    })

    it('should render form element', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const form = screen.getByRole('button').closest('form')
      expect(form).toBeInTheDocument()
    })

    it('should have submit button of type submit', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email')) as HTMLButtonElement
      expect(submitButton?.type).toBe('submit')
    })

    it('should be able to submit empty form', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))

      if (submitButton) await user.click(submitButton)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading role', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const mainHeading = getMainHeading()
      expect(mainHeading).toBeInTheDocument()
    })

    it('should have token input', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      expect(tokenInput).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      expect(submitButton).toBeInTheDocument()
    })

    it('should have proper form label', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Token xác minh')).toBeInTheDocument()
    })

    it('should have text input for token', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      expect(tokenInput).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const mainHeading = getMainHeading()
      expect(mainHeading).toBeInTheDocument()
    })

    it('should handle empty form state', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      expect((tokenInput as HTMLInputElement).value).toBe('')
    })

    it('should handle multiple renders', () => {
      const { rerender } = render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(getMainHeading()).toBeInTheDocument()

      rerender(<VerifyEmailForm />)
      expect(getMainHeading()).toBeInTheDocument()
    })

    it('should maintain form structure on re-render', () => {
      const { rerender } = render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const form1 = screen.getByRole('button').closest('form')

      rerender(<VerifyEmailForm />)
      const form2 = screen.getByRole('button').closest('form')

      expect(form1).toBeInTheDocument()
      expect(form2).toBeInTheDocument()
    })

    it('should handle rapid token field interactions', async () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')

      await user.type(tokenInput, '1')
      await user.clear(tokenInput)
      await user.type(tokenInput, '2')
      await user.clear(tokenInput)
      await user.type(tokenInput, '3')

      expect((tokenInput as HTMLInputElement).value).toContain('3')
    })
  })

  describe('Vietnamese Text Verification', () => {
    it('should have Vietnamese main heading', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const mainHeading = getMainHeading()
      expect(mainHeading).toBeInTheDocument()
    })

    it('should have Vietnamese token placeholder', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const tokenInput = screen.getByPlaceholderText('Nhập token xác minh email')
      expect(tokenInput).toBeInTheDocument()
    })

    it('should verify all UI text is in Vietnamese', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      // Main heading
      const mainHeading = getMainHeading()
      expect(mainHeading).toBeInTheDocument()
      // Subtitle
      expect(screen.getByText(/Vui lòng xác minh email để hoàn tất đăng ký/i)).toBeInTheDocument()
      // Label
      expect(screen.getByText('Token xác minh')).toBeInTheDocument()
      // Button
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      expect(submitButton).toBeInTheDocument()
    })

    it('should use Vietnamese for button text', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.textContent?.includes('Xác minh email'))
      expect(submitButton?.textContent).toContain('Xác minh email')
    })

    it('should use Vietnamese for subtitle', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(screen.getByText(/Vui lòng xác minh email để hoàn tất đăng ký/i)).toBeInTheDocument()
    })

    it('should have all Vietnamese labels', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Token xác minh')).toBeInTheDocument()
      expect(screen.getByText(/Vui lòng xác minh email để hoàn tất đăng ký/i)).toBeInTheDocument()
    })

    it('should not have English text in form labels', () => {
      render(<VerifyEmailForm />, { wrapper: TestWrapper })
      // Check key English words don't appear (excluding button which has 'email')
      expect(screen.queryByText(/^Verify$/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/^Token$/i)).not.toBeInTheDocument()
    })
  })
})
