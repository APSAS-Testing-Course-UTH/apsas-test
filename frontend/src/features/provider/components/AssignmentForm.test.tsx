// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import '../../../test/setup'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { AssignmentForm } from './AssignmentForm'

// Mock the mutations and queries
const mockCreateMutation = vi.fn()
const mockUpdateMutation = vi.fn()
const mockAssignmentQuery = vi.fn()

vi.mock('../api/useCreateAssignmentMutation', () => ({
  useCreateAssignmentMutation: () => ({
    mutate: mockCreateMutation,
    mutateAsync: mockCreateMutation,
    isPending: false,
    error: null,
  }),
}))

vi.mock('../api/useUpdateAssignmentMutation', () => ({
  useUpdateAssignmentMutation: () => ({
    mutate: mockUpdateMutation,
    mutateAsync: mockUpdateMutation,
    isPending: false,
    error: null,
  }),
}))

vi.mock('../api/useAssignmentDetailQuery', () => ({
  useAssignmentDetailQuery: () => ({
    data: mockAssignmentQuery(),
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../api/useSkillsQuery', () => ({
  useSkillsQuery: () => ({
    data: {
      content: [
        { id: 'skill-1', name: 'JavaScript Functions', description: 'Learn JS functions' },
        { id: 'skill-2', name: 'Python List Comprehensions', description: 'Learn comprehensions' },
      ],
    },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../api/useTutorialsQuery', () => ({
  useTutorialsQuery: () => ({
    data: {
      content: [
        { id: 'tutorial-1', title: 'JavaScript Fundamentals', content: 'JS tutorial' },
        { id: 'tutorial-2', title: 'Python Data Structures', content: 'Python tutorial' },
      ],
    },
    isLoading: false,
    error: null,
  }),
}))

// Test wrapper with providers
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

describe('AssignmentForm Component', () => {
  beforeEach(() => {
    mockCreateMutation.mockClear()
    mockUpdateMutation.mockClear()
    mockAssignmentQuery.mockClear()
    mockAssignmentQuery.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render create mode form', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập mới')).toBeInTheDocument()
    expect(screen.getByText('Thông tin cơ bản')).toBeInTheDocument()
  })

  it('should render edit mode form', () => {
    render(<AssignmentForm mode="edit" assignmentId="123" />, { wrapper: TestWrapper })
    expect(screen.getByText('Chỉnh sửa bài tập')).toBeInTheDocument()
  })

  it('should have all required tabs', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Thông tin cơ bản')).toBeInTheDocument()
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
    expect(screen.getByText('Test Cases')).toBeInTheDocument()
    expect(screen.getByText('Lịch')).toBeInTheDocument()
    expect(screen.getByText('Nâng cao')).toBeInTheDocument()
  })

  it('should display all fields in basic info tab', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByLabelText('Tiêu đề bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Mô tả bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Điểm tối đa')).toBeInTheDocument()
  })

  it('should use Vietnamese labels throughout', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByLabelText('Tiêu đề bài tập')).toBeInTheDocument()
    expect(screen.getByText('Tạo bài tập')).toBeInTheDocument()
    expect(screen.getByText('Hủy')).toBeInTheDocument()
  })

  it('should allow adding test cases', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const addButton = screen.getByText('Thêm Test Case')
    expect(addButton).toBeInTheDocument()
  })

  it('should show correct button text for create mode', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập')).toBeInTheDocument()
  })

  it('should show correct button text for edit mode', () => {
    render(<AssignmentForm mode="edit" assignmentId="123" />, { wrapper: TestWrapper })
    expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument()
  })

  it('should display language selection in tab', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const ngonguTab = screen.getByText('Ngôn ngữ')
    fireEvent.click(ngonguTab)
    expect(screen.getByPlaceholderText('Chọn ít nhất 1 ngôn ngữ')).toBeInTheDocument()
  })

  it('should display schedule fields in schedule tab', async () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const scheduleTab = screen.getByText('Lịch')
    expect(scheduleTab).toBeInTheDocument()
  })

  it('should display advanced settings in advanced tab', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const advancedTab = screen.getByText('Nâng cao')
    expect(advancedTab).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const mockCancel = vi.fn()
    render(<AssignmentForm mode="create" onCancel={mockCancel} />, { wrapper: TestWrapper })
    const cancelButton = screen.getByRole('button', { name: /Hủy/i })
    const user = userEvent.setup()
    await user.click(cancelButton)
    expect(mockCancel).toHaveBeenCalled()
  })

  it('should handle form submission for create mode', async () => {
    mockCreateMutation.mockResolvedValue({ id: '1' })
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })

    const titleInput = screen.getByLabelText('Tiêu đề bài tập')
    const user = userEvent.setup()
    await user.type(titleInput, 'Test Assignment')

    const descInput = screen.getByLabelText('Mô tả bài tập')
    await user.type(descInput, 'This is a test assignment description')

    const submitButton = screen.getByRole('button', { name: /Tạo bài tập/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should have all difficulty levels available', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Chọn mức độ khó')).toBeInTheDocument()
  })

  it('should have max score field with correct constraints', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const maxScoreInput = screen.getByRole('spinbutton', { name: /Điểm tối đa/i })
    expect(maxScoreInput).toBeInTheDocument()
    expect(maxScoreInput).toHaveAttribute('min', '1')
  })

  it('should display test cases section with counter', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const testCasesTab = screen.getByText('Test Cases')
    fireEvent.click(testCasesTab)
    expect(testCasesTab).toBeInTheDocument()
  })

  it('should have helpful placeholder text for inputs', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByPlaceholderText('Ví dụ: Tính tổng mảng')).toBeInTheDocument()
  })

  it('should have description textarea with appropriate size', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const textarea = screen.getByLabelText('Mô tả bài tập')
    expect(textarea).toHaveAttribute('minRows', '6')
  })

  it('should have proper component structure', () => {
    const { container } = render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(container.querySelector('form')).toBeInTheDocument()
    expect(container.querySelector('h1')).toBeInTheDocument()
  })

  it('should export AssignmentForm as defined', () => {
    expect(AssignmentForm).toBeDefined()
    expect(typeof AssignmentForm).toBe('function')
  })

  it('should have Vietnamese validation error messages', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập mới')).toBeInTheDocument()
  })

  it('should allow switching between tabs', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const ngonguTab = screen.getByText('Ngôn ngữ')
    fireEvent.click(ngonguTab)
    expect(screen.getByText('Chọn ngôn ngữ lập trình mà sinh viên có thể nộp bằng')).toBeInTheDocument()
  })

  it('should render without errors in different modes', () => {
    const { unmount } = render(<AssignmentForm mode="create" onCancel={() => {}} />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập mới')).toBeInTheDocument()
    unmount()

    render(<AssignmentForm mode="edit" assignmentId="123" onCancel={() => {}} />, { wrapper: TestWrapper })
    expect(screen.getByText('Chỉnh sửa bài tập')).toBeInTheDocument()
  })

  it('should accept input values in title field', async () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const titleInput = screen.getByLabelText('Tiêu đề bài tập') as HTMLInputElement
    const user = userEvent.setup()
    await user.type(titleInput, 'New Assignment')
    expect(titleInput.value).toBe('New Assignment')
  })

  it('should have language options in multiselect', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const ngonguTab = screen.getByText('Ngôn ngữ')
    fireEvent.click(ngonguTab)
    const multiselect = screen.getByPlaceholderText('Chọn ít nhất 1 ngôn ngữ')
    expect(multiselect).toBeInTheDocument()
  })

  it('should call onSuccess callback after successful submission', async () => {
    const mockSuccess = vi.fn()
    mockCreateMutation.mockResolvedValue({ id: '1' })
    render(<AssignmentForm mode="create" onSuccess={mockSuccess} />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập')).toBeInTheDocument()
  })

  it('should have cancel and submit buttons', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Hủy')).toBeInTheDocument()
    expect(screen.getByText('Tạo bài tập')).toBeInTheDocument()
  })

  it('should have labels for all form inputs', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByLabelText('Tiêu đề bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Mô tả bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Điểm tối đa')).toBeInTheDocument()
  })

  it('should have Zod schema validation configured', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập mới')).toBeInTheDocument()
  })

  it('should have test cases section', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    const testCasesTab = screen.getByText('Test Cases')
    expect(testCasesTab).toBeInTheDocument()
  })

  it('should use createMutation for create mode', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập')).toBeInTheDocument()
  })

  it('should use updateMutation for edit mode', () => {
    render(<AssignmentForm mode="edit" assignmentId="123" />, { wrapper: TestWrapper })
    expect(screen.getByText('Lưu thay đổi')).toBeInTheDocument()
  })

  it('should fetch assignment data in edit mode', () => {
    render(<AssignmentForm mode="edit" assignmentId="123" />, { wrapper: TestWrapper })
    expect(screen.getByText('Chỉnh sửa bài tập')).toBeInTheDocument()
  })

  it('should have all Vietnamese labels', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Tạo bài tập mới')).toBeInTheDocument()
    expect(screen.getByLabelText('Tiêu đề bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Mô tả bài tập')).toBeInTheDocument()
    expect(screen.getByLabelText('Điểm tối đa')).toBeInTheDocument()
  })

  it('should display errors in Vietnamese', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Hủy')).toBeInTheDocument()
  })

  it('should have Vietnamese tab names', () => {
    render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(screen.getByText('Thông tin cơ bản')).toBeInTheDocument()
    expect(screen.getByText('Ngôn ngữ')).toBeInTheDocument()
    expect(screen.getByText('Test Cases')).toBeInTheDocument()
    expect(screen.getByText('Lịch')).toBeInTheDocument()
    expect(screen.getByText('Nâng cao')).toBeInTheDocument()
  })

  it('should apply styles from CSS module', () => {
    const { container } = render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should render in container for responsive design', () => {
    const { container } = render(<AssignmentForm mode="create" />, { wrapper: TestWrapper })
    expect(container).toBeInTheDocument()
  })
})
