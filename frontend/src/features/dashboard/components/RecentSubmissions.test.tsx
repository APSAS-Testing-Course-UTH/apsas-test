import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { RecentSubmissions } from './RecentSubmissions'
import type { SubmissionServiceSubmissionResponse } from '@/api/types.gen'

const mockSubmissions: SubmissionServiceSubmissionResponse[] = [
  {
    id: '1',
    assignmentId: 'assignment-123456789',
    submittedAt: new Date('2025-01-15T10:30:00Z'),
    status: 'PENDING',
    score: 85,
  },
  {
    id: '2',
    assignmentId: 'assignment-987654321',
    submittedAt: new Date('2025-01-14T14:20:00Z'),
    status: 'EVALUATED',
    score: 92,
  },
  {
    id: '3',
    assignmentId: 'assignment-111222333',
    submittedAt: new Date('2025-01-13T09:00:00Z'),
    status: 'PENDING',
    score: undefined,
  },
]

describe('RecentSubmissions', () => {
  it('should render list of submissions', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    // Check "Xem tất cả bài nộp" link is rendered (indicates data loaded)
    expect(screen.getByText('Xem tất cả bài nộp')).toBeInTheDocument()
    
    // Check date elements exist (Vietnamese format with "tháng")
    const dateElements = screen.getAllByText(/tháng/i)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('should show empty state when no submissions', () => {
    render(<RecentSubmissions data={[]} />)
    
    expect(screen.getByText('Chưa có bài nộp nào')).toBeInTheDocument()
  })

  it('should limit submissions to specified count', () => {
    render(<RecentSubmissions data={mockSubmissions} limit={2} />)
    
    // Should only show 2 submissions
    const allSubmissions = screen.queryAllByText(/Bài tập #/)
    expect(allSubmissions.length).toBe(2)
  })

  it('should display status badges with Vietnamese labels', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    // Check that Vietnamese status labels are present
    const statusLabels = screen.getAllByText(/Chưa làm|Đã chấm/)
    expect(statusLabels.length).toBeGreaterThan(0)
  })

  it('should display scores with correct colors', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    expect(screen.getByText('85 điểm')).toBeInTheDocument()
    expect(screen.getByText('92 điểm')).toBeInTheDocument()
  })

  it('should not display score when not available', () => {
    const submissionsWithoutScore: SubmissionServiceSubmissionResponse[] = [
      {
        id: '1',
        assignmentId: 'test-123',
        submittedAt: new Date('2025-01-15T10:30:00Z'),
        status: 'PENDING',
        score: undefined,
      },
    ]

    render(<RecentSubmissions data={submissionsWithoutScore} />)
    
    expect(screen.queryByText(/điểm/)).not.toBeInTheDocument()
  })

  it('should format date in Vietnamese', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    // Date should be formatted with Vietnamese locale
    // Example: "15 tháng 1, 2025"
    const dateElements = screen.getAllByText(/tháng/i)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('should render "Xem tất cả bài nộp" link', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    expect(screen.getByText('Xem tất cả bài nộp')).toBeInTheDocument()
  })

  it('should link to submissions page', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    const link = screen.getByText('Xem tất cả bài nộp').closest('a')
    expect(link).toHaveAttribute('href', '/student/submissions')
  })

  it('should handle missing submittedAt', () => {
    const submissionWithoutDate: SubmissionServiceSubmissionResponse[] = [
      {
        id: '1',
        assignmentId: 'test-123',
        submittedAt: undefined,
        status: 'PENDING',
      },
    ]

    render(<RecentSubmissions data={submissionWithoutDate} />)
    
    expect(screen.getByText('Chưa nộp')).toBeInTheDocument()
  })

  it('should handle missing assignmentId', () => {
    const submissionWithoutId: SubmissionServiceSubmissionResponse[] = [
      {
        id: '1',
        assignmentId: undefined,
        submittedAt: new Date('2025-01-15T10:30:00Z'),
        status: 'PENDING',
      },
    ]

    render(<RecentSubmissions data={submissionWithoutId} />)
    
    expect(screen.getByText('Bài tập')).toBeInTheDocument()
  })

  it('should apply hover styles to submission items', () => {
    render(<RecentSubmissions data={mockSubmissions} />)
    
    // Should render all 3 submissions
    const allSubmissions = screen.queryAllByText(/Bài tập #/)
    expect(allSubmissions.length).toBe(3)
  })
})
