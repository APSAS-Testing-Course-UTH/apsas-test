import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ChangePasswordModal } from './ChangePasswordModal'
import * as hooks from '../api/hooks'

// Mock the hooks
vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks')
  return {
    ...actual,
    useChangePassword: vi.fn(),
  }
})

describe('ChangePasswordModal', () => {
  let queryClient: QueryClient
  const mockMutateAsync = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    vi.clearAllMocks()

    // Default mock implementation
    vi.mocked(hooks.useChangePassword).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      mutate: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      status: 'idle',
      submittedAt: 0,
      reset: vi.fn(),
    } as any)
  })

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Notifications />
          <ChangePasswordModal
            opened={true}
            onClose={mockOnClose}
            {...props}
          />
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  it('should render modal with Vietnamese title', () => {
    renderComponent()

    expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument()
  })

  it('should display all password fields with Vietnamese labels', () => {
    renderComponent()

    expect(screen.getByText('Mật khẩu hiện tại')).toBeInTheDocument()
    expect(screen.getByText('Mật khẩu mới')).toBeInTheDocument()
    expect(screen.getByText('Xác nhận mật khẩu mới')).toBeInTheDocument()
  })

  it('should not submit when current password is empty', async () => {
    renderComponent()
    const user = userEvent.setup()

    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill only new password fields
    await user.type(newPasswordInput, 'newpassword123')
    await user.type(confirmPasswordInput, 'newpassword123')
    await user.click(submitButton)

    // Wait a bit to ensure mutation is not called
    await new Promise(resolve => setTimeout(resolve, 100))

    // Validation should prevent submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should not submit when new password is less than 8 characters', async () => {
    renderComponent()
    const user = userEvent.setup()

    const currentPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu hiện tại')
    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill with short password
    await user.type(currentPasswordInput, 'oldpass123')
    await user.type(newPasswordInput, 'short')
    await user.type(confirmPasswordInput, 'short')
    await user.click(submitButton)

    // Wait a bit to ensure mutation is not called
    await new Promise(resolve => setTimeout(resolve, 100))

    // Validation should prevent submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should not submit when passwords do not match', async () => {
    renderComponent()
    const user = userEvent.setup()

    const currentPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu hiện tại')
    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill with mismatched passwords
    await user.type(currentPasswordInput, 'oldpass123')
    await user.type(newPasswordInput, 'newpass123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)

    // Wait a bit to ensure mutation is not called
    await new Promise(resolve => setTimeout(resolve, 100))

    // Validation should prevent submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should submit form with valid passwords', async () => {
    mockMutateAsync.mockResolvedValue({})
    renderComponent()
    const user = userEvent.setup()

    const currentPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu hiện tại')
    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill with valid data
    await user.type(currentPasswordInput, 'oldpass123')
    await user.type(newPasswordInput, 'newpass123')
    await user.type(confirmPasswordInput, 'newpass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        currentPassword: 'oldpass123',
        newPassword: 'newpass123',
      })
    })
  })

  it('should show success notification and close modal on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({})
    renderComponent()
    const user = userEvent.setup()

    const currentPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu hiện tại')
    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill with valid data
    await user.type(currentPasswordInput, 'oldpass123')
    await user.type(newPasswordInput, 'newpass123')
    await user.type(confirmPasswordInput, 'newpass123')
    await user.click(submitButton)

    await waitFor(() => {
      const notifications = screen.queryAllByText('Đổi mật khẩu thành công')
      expect(notifications.length).toBeGreaterThan(0)
    })

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show error notification on failed submit', async () => {
    mockMutateAsync.mockRejectedValue(new Error('API Error'))
    renderComponent()
    const user = userEvent.setup()

    const currentPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu hiện tại')
    const newPasswordInput = screen.getByPlaceholderText('Nhập mật khẩu mới (tối thiểu 8 ký tự)')
    const confirmPasswordInput = screen.getByPlaceholderText('Nhập lại mật khẩu mới')
    const submitButton = screen.getByText('Xác nhận')

    // Fill with valid data
    await user.type(currentPasswordInput, 'oldpass123')
    await user.type(newPasswordInput, 'newpass123')
    await user.type(confirmPasswordInput, 'newpass123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Lỗi khi đổi mật khẩu. Vui lòng thử lại.')).toBeInTheDocument()
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
