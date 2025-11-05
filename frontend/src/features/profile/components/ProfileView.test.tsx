import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ProfileView } from './ProfileView'
import * as hooks from '../api/hooks'
import type { User } from '../types'

// Mock the hooks
vi.mock('../api/hooks')

// Create test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

// Wrapper component with all required providers
const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    )
  }
}

// Mock user data
const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  role: 'STUDENT',
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-20T14:45:00Z'),
}

describe('ProfileView', () => {
  it('should show loading state initially', () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    expect(screen.getByText('Đang tải thông tin...')).toBeInTheDocument()
  })

  it('should display user profile when loaded', async () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    await waitFor(() => {
      expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument()
    })

    // Check user name is displayed
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()

    // Check email is displayed (appears twice - in summary and details)
    const emails = screen.getAllByText('test@example.com')
    expect(emails).toHaveLength(2)

    // Check role is displayed in Vietnamese (appears twice - badge and details)
    const roles = screen.getAllByText('Sinh viên')
    expect(roles).toHaveLength(2)

    // Check email verification badge
    expect(screen.getByText('Email đã xác thực')).toBeInTheDocument()
  })

  it('should show error state when loading fails', () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    expect(screen.getByText('Lỗi khi tải thông tin người dùng')).toBeInTheDocument()
  })

  it('should show empty state when user is null', () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    expect(screen.getByText('Không tìm thấy thông tin người dùng')).toBeInTheDocument()
  })

  it('should display all Vietnamese field labels', async () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    await waitFor(() => {
      expect(screen.getByText('Họ:')).toBeInTheDocument()
    })

    expect(screen.getByText('Tên:')).toBeInTheDocument()
    expect(screen.getByText('Email:')).toBeInTheDocument()
    expect(screen.getByText('Vai trò:')).toBeInTheDocument()
    expect(screen.getByText('Ngày tạo:')).toBeInTheDocument()
    expect(screen.getByText('Ngày cập nhật:')).toBeInTheDocument()
  })

  it('should call onEditProfile when edit button is clicked', async () => {
    const queryClient = createTestQueryClient()
    const onEditProfile = vi.fn()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any)

    const user = userEvent.setup()
    render(<ProfileView onEditProfile={onEditProfile} />, {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(screen.getByText('Chỉnh sửa thông tin')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Chỉnh sửa thông tin')
    await user.click(editButton)

    expect(onEditProfile).toHaveBeenCalledTimes(1)
  })

  it('should call onChangePassword when change password button is clicked', async () => {
    const queryClient = createTestQueryClient()
    const onChangePassword = vi.fn()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any)

    const user = userEvent.setup()
    render(<ProfileView onChangePassword={onChangePassword} />, {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument()
    })

    const changePasswordButton = screen.getByText('Đổi mật khẩu')
    await user.click(changePasswordButton)

    expect(onChangePassword).toHaveBeenCalledTimes(1)
  })

  it('should display created and updated dates', async () => {
    const queryClient = createTestQueryClient()
    vi.mocked(hooks.useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any)

    render(<ProfileView />, { wrapper: createWrapper(queryClient) })

    await waitFor(() => {
      expect(screen.getByText('Hồ sơ cá nhân')).toBeInTheDocument()
    })

    // Check that date labels are present
    expect(screen.getByText('Ngày tạo:')).toBeInTheDocument()
    expect(screen.getByText('Ngày cập nhật:')).toBeInTheDocument()

    // Check that dates contain "2024" (year from mock data)
    const dateElements = screen.getAllByText(/2024/)
    expect(dateElements.length).toBeGreaterThan(0)
  })
})
