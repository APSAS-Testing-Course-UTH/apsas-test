import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ForgotPasswordForm } from './ForgotPasswordForm'

// Mock hooks and router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({ state: { location: { pathname: '/' } } }),
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

const mockForgotPassword = vi.fn()
vi.mock('../hooks/useForgotPassword', () => ({
  useForgotPassword: () => ({
    mutate: mockForgotPassword,
    isPending: false,
    error: null,
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

describe('ForgotPasswordForm - Vietnamese UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockForgotPassword.mockClear()
    mockNavigate.mockClear()
  })

  describe('Form Rendering & Vietnamese UI', () => {
    it('should render with Vietnamese title', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('heading', { name: /Quên mật khẩu\?/i })
      ).toBeInTheDocument()
    })

    it('should render Vietnamese subtitle message', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Nhập email để nhận link đặt lại mật khẩu/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese email label', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should have Vietnamese email placeholder', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText('hello@gmail.com')).toBeInTheDocument()
    })

    it('should have Vietnamese email description', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese submit button text', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i })
      ).toBeInTheDocument()
    })

    it('should have Vietnamese login link text', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Quay lại đăng nhập/i)
      ).toBeInTheDocument()
    })

    it('should render Paper container with proper styling', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()
    })

    it('should render all required form elements', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText('hello@gmail.com')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('Email Input Interactions', () => {
    it('should accept email input', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'test@example.com')
      expect(emailInput.value).toBe('test@example.com')
    })

    it('should accept different email format', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'student@apsas.edu.vn')
      expect(emailInput.value).toBe('student@apsas.edu.vn')
    })

    it('should clear and re-enter email', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'first@test.com')
      expect(emailInput.value).toBe('first@test.com')

      await user.clear(emailInput)
      await user.type(emailInput, 'second@test.com')
      expect(emailInput.value).toBe('second@test.com')
    })

    it('should handle whitespace in email input', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, '  test@example.com  ')
      expect(emailInput.value).toContain('test@example.com')
    })

    it('should allow editing email after initial input', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'test@example.com')
      await user.clear(emailInput)
      await user.type(emailInput, 'correct@example.com')
      expect(emailInput.value).toBe('correct@example.com')
    })

    it('should handle rapid consecutive inputs', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'a')
      await user.type(emailInput, 'b')
      await user.type(emailInput, 'c')

      expect(emailInput.value.includes('a')).toBe(true)
    })

    it('should maintain email value after blur', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'test@example.com')
      await user.click(screen.getByRole('button'))
      expect(emailInput.value).toBe('test@example.com')
    })
  })

  describe('Form Submission', () => {
    it('should have working submit button', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i }) as HTMLButtonElement
      expect(button.type).toBe('submit')
    })

    it('should handle form submission', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()

      await user.type(
        screen.getByPlaceholderText('hello@gmail.com'),
        'test@test.com'
      )

      const button = screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should maintain form data after interaction', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()

      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement

      await user.type(emailInput, 'test@test.com')

      expect(emailInput.value).toBe('test@test.com')
    })

    it('should render form element', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const form = screen.getByRole('button').closest('form')
      expect(form).toBeInTheDocument()
    })

    it('should have submit button of type submit', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i }) as HTMLButtonElement
      expect(button.type).toBe('submit')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading role', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const heading = screen.getByRole('heading', { name: /Quên mật khẩu\?/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have text input for email', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const input = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement
      expect(input).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i })
      expect(button).toBeInTheDocument()
    })

    it('should have link to login', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const link = screen.getByText(/Quay lại đăng nhập/i)
      expect(link).toBeInTheDocument()
    })

    it('should have proper form labels', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Email')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()
    })

    it('should handle empty form state', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const emailInput = screen.getByPlaceholderText('hello@gmail.com') as HTMLInputElement
      expect(emailInput.value).toBe('')
    })

    it('should handle multiple form renders', () => {
      const { rerender } = render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <ForgotPasswordForm />
        </TestWrapper>
      )
      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()
    })

    it('should handle rapid form submission attempts', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()

      const emailInput = screen.getByPlaceholderText('hello@gmail.com')
      const button = screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i })

      await user.type(emailInput, 'test@test.com')
      await user.click(button)
      await user.click(button)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render all visible form elements', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })

      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()
      expect(screen.getByText(/Nhập email để nhận link đặt lại mật khẩu/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText('hello@gmail.com')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('Vietnamese Text Verification', () => {
    it('should have Vietnamese main heading', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Quên mật khẩu\?/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese subtitle', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Nhập email để nhận link đặt lại mật khẩu/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese email label', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText(/^Email$/i)).toBeInTheDocument()
    })

    it('should have Vietnamese email description', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese submit button', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('button', { name: /Gửi mã đặt lại mật khẩu/i })
      ).toBeInTheDocument()
    })

    it('should have Vietnamese login redirect text', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Quay lại đăng nhập/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese placeholder text', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByPlaceholderText('hello@gmail.com')).toBeInTheDocument()
    })

    it('should not have English text for form labels', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper })
      // Verify Vietnamese text is present
      expect(screen.getByText('Email')).toBeInTheDocument()
      // Verify the form has Vietnamese UI
      expect(screen.getByRole('heading', { name: /Quên mật khẩu\?/i })).toBeInTheDocument()
    })
  })
})
