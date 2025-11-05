import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ProfileEditModal } from './ProfileEditModal'
import * as hooks from '../api/hooks'
import type { User } from '../types'

// Mock the hooks
vi.mock('../api/hooks', async () => {
  const actual = await vi.importActual('../api/hooks')
  return {
    ...actual,
    useUpdateProfile: vi.fn(),
  }
})

// Mock user data
const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  role: 'STUDENT',
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
}

describe('ProfileEditModal', () => {
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
    vi.mocked(hooks.useUpdateProfile).mockReturnValue({
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
          <ProfileEditModal
            opened={true}
            onClose={mockOnClose}
            user={mockUser}
            {...props}
          />
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  it('should render modal with Vietnamese title', () => {
    renderComponent()

    expect(screen.getByText('Cập nhật thông tin')).toBeInTheDocument()
  })

  it('should display form fields with Vietnamese labels', () => {
    renderComponent()

    expect(screen.getByText('Họ')).toBeInTheDocument()
    expect(screen.getByText('Tên')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should pre-fill form with user data', () => {
    renderComponent()

    const firstNameInput = screen.getByPlaceholderText('Nhập họ của bạn') as HTMLInputElement
    const lastNameInput = screen.getByPlaceholderText('Nhập tên của bạn') as HTMLInputElement
    const emailInput = screen.getByDisplayValue('test@example.com') as HTMLInputElement

    expect(firstNameInput.value).toBe('Nguyễn')
    expect(lastNameInput.value).toBe('Văn A')
    expect(emailInput.value).toBe('test@example.com')
    expect(emailInput).toBeDisabled()
  })

  it('should not submit when firstName is empty', async () => {
    renderComponent()
    const user = userEvent.setup()

    const firstNameInput = screen.getByPlaceholderText('Nhập họ của bạn')
    const submitButton = screen.getByText('Lưu')

    // Clear the pre-filled value
    await user.clear(firstNameInput)
    await user.click(submitButton)

    // Wait a bit to ensure mutation is not called
    await new Promise(resolve => setTimeout(resolve, 100))

    // Validation should prevent submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should not submit when lastName is empty', async () => {
    renderComponent()
    const user = userEvent.setup()

    const lastNameInput = screen.getByPlaceholderText('Nhập tên của bạn')
    const submitButton = screen.getByText('Lưu')

    // Clear the pre-filled value
    await user.clear(lastNameInput)
    await user.click(submitButton)

    // Wait a bit to ensure mutation is not called
    await new Promise(resolve => setTimeout(resolve, 100))

    // Validation should prevent submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should show validation error when firstName exceeds 100 characters', async () => {
    renderComponent()
    const user = userEvent.setup()

    const firstNameInput = screen.getByPlaceholderText('Nhập họ của bạn')
    const submitButton = screen.getByText('Lưu')

    // Clear and type a long name
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'A'.repeat(101))
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Họ không được quá 100 ký tự')).toBeInTheDocument()
    })

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    mockMutateAsync.mockResolvedValue({})
    renderComponent()
    const user = userEvent.setup()

    const firstNameInput = screen.getByPlaceholderText('Nhập họ của bạn')
    const lastNameInput = screen.getByPlaceholderText('Nhập tên của bạn')
    const submitButton = screen.getByText('Lưu')

    // Update fields
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Trần')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Văn B')

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        firstName: 'Trần',
        lastName: 'Văn B',
      })
    })
  })

  it('should show success notification and close modal on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({})
    renderComponent()
    const user = userEvent.setup()

    const submitButton = screen.getByText('Lưu')
    await user.click(submitButton)

    await waitFor(() => {
      const notifications = screen.queryAllByText('Cập nhật thông tin thành công')
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

    const submitButton = screen.getByText('Lưu')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Lỗi khi cập nhật thông tin. Vui lòng thử lại.')).toBeInTheDocument()
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should call onClose when cancel button is clicked', async () => {
    renderComponent()
    const user = userEvent.setup()

    const cancelButton = screen.getByText('Hủy')
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
