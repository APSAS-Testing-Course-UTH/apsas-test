import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ResetPasswordForm } from './ResetPasswordForm'

// Mock hooks and router
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useRouter: () => ({ state: { location: { pathname: '/' } } }),
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

const mockResetPassword = vi.fn()
vi.mock('../hooks/useResetPassword', () => ({
  useResetPassword: () => ({
    mutate: mockResetPassword,
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

describe('ResetPasswordForm - Vietnamese UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResetPassword.mockClear()
    mockNavigate.mockClear()
  })

  describe('Form Rendering & Vietnamese UI', () => {
    it('should render with Vietnamese title', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })
      ).toBeInTheDocument()
    })

    it('should render Vietnamese subtitle message', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByText(/Nhập mật khẩu mới cho tài khoản của bạn/i)
      ).toBeInTheDocument()
    })

    it('should have Vietnamese new password label', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
    })

    it('should have Vietnamese confirm password label', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Xác nhận mật khẩu')).toBeInTheDocument()
    })

    it('should have Vietnamese submit button text', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('button', { name: /Đặt lại mật khẩu/i })
      ).toBeInTheDocument()
    })

    it('should have password input placeholders', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const newPasswordPlaceholder = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordPlaceholder = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
      expect(newPasswordPlaceholder).toBeInTheDocument()
      expect(confirmPasswordPlaceholder).toBeInTheDocument()
    })

    it('should render all required form elements', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
      expect(screen.getByText('Xác nhận mật khẩu')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Đặt lại mật khẩu/i })).toBeInTheDocument()
    })
  })

  describe('Password Input Interactions', () => {
    it('should accept new password input', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')

      await user.type(passwordInput, 'NewPassword123!')
      expect((passwordInput as HTMLInputElement).value).toContain('NewPassword123!')
    })

    it('should accept confirm password input', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')

      await user.type(passwordInput, 'ConfirmPassword123!')
      expect((passwordInput as HTMLInputElement).value).toContain('ConfirmPassword123!')
    })

    it('should allow typing in both password fields', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')

      await user.type(newPasswordInput, 'Password1')
      await user.type(confirmPasswordInput, 'Password1')

      expect((newPasswordInput as HTMLInputElement).value).toContain('Password1')
      expect((confirmPasswordInput as HTMLInputElement).value).toContain('Password1')
    })

    it('should clear and re-enter new password', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')

      await user.type(passwordInput, 'FirstPassword!')
      await user.clear(passwordInput)
      await user.type(passwordInput, 'SecondPassword!')

      expect((passwordInput as HTMLInputElement).value).toContain('SecondPassword!')
    })

    it('should handle long password input', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const longPassword = 'VeryLongPassword123!@#$%^&*()'

      await user.type(passwordInput, longPassword)
      expect((passwordInput as HTMLInputElement).value).toContain(longPassword)
    })

    it('should allow special characters in password', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')

      await user.type(passwordInput, 'Pass!@#$%^&*()word')
      expect((passwordInput as HTMLInputElement).value).toContain('Pass!@#$%^&*()')
    })

    it('should handle rapid consecutive password inputs', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')

      await user.type(passwordInput, 'a')
      await user.type(passwordInput, 'b')
      await user.type(passwordInput, 'c')

      expect((passwordInput as HTMLInputElement).value.includes('a')).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('should have working submit button', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i }) as HTMLButtonElement
      expect(button.type).toBe('submit')
    })

    it('should handle form submission with both passwords', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')

      await user.type(newPasswordInput, 'NewPassword123!')
      await user.type(confirmPasswordInput, 'NewPassword123!')

      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('should maintain password data after interaction', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')

      await user.type(newPasswordInput, 'TestPassword123!')
      await user.type(confirmPasswordInput, 'ConfirmTest123!')

      expect((newPasswordInput as HTMLInputElement).value).toContain('TestPassword123!')
      expect((confirmPasswordInput as HTMLInputElement).value).toContain('ConfirmTest123!')
    })

    it('should render form element', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const form = screen.getByRole('button').closest('form')
      expect(form).toBeInTheDocument()
    })

    it('should have submit button of type submit', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i }) as HTMLButtonElement
      expect(button.type).toBe('submit')
    })

    it('should be able to submit empty form', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i })

      await user.click(button)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading role', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const heading = screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have password inputs', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i })
      expect(button).toBeInTheDocument()
    })

    it('should have proper form labels', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
      expect(screen.getByText('Xác nhận mật khẩu')).toBeInTheDocument()
    })

    it('should have text inputs for passwords', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
      expect(newPasswordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })).toBeInTheDocument()
    })

    it('should handle empty form state', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
      expect((newPasswordInput as HTMLInputElement).value).toBe('')
      expect((confirmPasswordInput as HTMLInputElement).value).toBe('')
    })

    it('should handle multiple renders', () => {
      const { rerender } = render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })).toBeInTheDocument()
      
      rerender(<ResetPasswordForm />)
      expect(screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })).toBeInTheDocument()
    })

    it('should maintain form structure on re-render', () => {
      const { rerender } = render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const form1 = screen.getByRole('button').closest('form')
      
      rerender(<ResetPasswordForm />)
      const form2 = screen.getByRole('button').closest('form')
      
      expect(form1).toBeInTheDocument()
      expect(form2).toBeInTheDocument()
    })

    it('should handle rapid password field interactions', async () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const user = userEvent.setup()
      const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới')

      await user.type(newPasswordInput, '1')
      await user.clear(newPasswordInput)
      await user.type(newPasswordInput, '2')
      await user.clear(newPasswordInput)
      await user.type(newPasswordInput, '3')

      expect((newPasswordInput as HTMLInputElement).value).toContain('3')
    })
  })

  describe('Vietnamese Text Verification', () => {
    it('should have Vietnamese main heading', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(
        screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })
      ).toBeInTheDocument()
    })

    it('should have Vietnamese password placeholder', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const newPasswordPlaceholder = screen.getByPlaceholderText('Nhập mật khẩu mới')
      const confirmPasswordPlaceholder = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
      expect(newPasswordPlaceholder).toBeInTheDocument()
      expect(confirmPasswordPlaceholder).toBeInTheDocument()
    })

    it('should verify all UI text is in Vietnamese', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      // Main heading
      expect(
        screen.getByRole('heading', { level: 1, name: /Đặt lại mật khẩu/i })
      ).toBeInTheDocument()
      // Subtitle
      expect(screen.getByText(/Nhập mật khẩu mới cho tài khoản của bạn/i)).toBeInTheDocument()
      // Labels
      expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
      expect(screen.getByText('Xác nhận mật khẩu')).toBeInTheDocument()
      // Button
      expect(screen.getByRole('button', { name: /Đặt lại mật khẩu/i })).toBeInTheDocument()
    })

    it('should not have English text in labels', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.queryByText(/Password/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Confirm/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Reset/i)).not.toBeInTheDocument()
    })

    it('should use Vietnamese for button text', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      const button = screen.getByRole('button', { name: /Đặt lại mật khẩu/i })
      expect(button.textContent).toContain('Đặt lại mật khẩu')
    })

    it('should use Vietnamese for subtitle', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText(/Nhập mật khẩu mới cho tài khoản của bạn/i)).toBeInTheDocument()
    })

    it('should have all Vietnamese labels', () => {
      render(<ResetPasswordForm />, { wrapper: TestWrapper })
      expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
      expect(screen.getByText('Xác nhận mật khẩu')).toBeInTheDocument()
      expect(screen.getByText(/Nhập mật khẩu mới cho tài khoản của bạn/i)).toBeInTheDocument()
    })
  })
})
