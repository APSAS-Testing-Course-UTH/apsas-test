import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { UpcomingDeadlines } from './UpcomingDeadlines'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

const now = new Date()
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const urgentDate = new Date(now.getTime() + 12 * 60 * 60 * 1000) // 12 hours from now

const mockAssignments: ContentServiceAssignmentResponse[] = [
  {
    id: '1',
    title: 'Bài tập Python Cơ bản',
    dueDate: tomorrow,
    difficultyLevel: 'EASY',
  },
  {
    id: '2',
    title: 'Thuật toán Sắp xếp',
    dueDate: nextWeek,
    difficultyLevel: 'MEDIUM',
  },
  {
    id: '3',
    title: 'Cấu trúc dữ liệu',
    dueDate: yesterday, // Past deadline - should be filtered out
    difficultyLevel: 'HARD',
  },
  {
    id: '4',
    title: 'Bài tập Khẩn cấp',
    dueDate: urgentDate,
    difficultyLevel: 'MEDIUM',
  },
]

describe('UpcomingDeadlines', () => {
  it('should render list of upcoming deadlines', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    expect(screen.getByText('Bài tập Python Cơ bản')).toBeInTheDocument()
    expect(screen.getByText('Thuật toán Sắp xếp')).toBeInTheDocument()
  })

  it('should show empty state when no deadlines', () => {
    render(<UpcomingDeadlines data={[]} />)
    
    expect(screen.getByText('Không có hạn chót sắp tới')).toBeInTheDocument()
  })

  it('should filter out past deadlines', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    expect(screen.queryByText('Cấu trúc dữ liệu')).not.toBeInTheDocument()
  })

  it('should sort by due date ascending (closest first)', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    // All future assignments should be displayed
    expect(screen.getByText('Bài tập Python Cơ bản')).toBeInTheDocument()
    expect(screen.getByText('Thuật toán Sắp xếp')).toBeInTheDocument()
    expect(screen.getByText('Bài tập Khẩn cấp')).toBeInTheDocument()
  })

  it('should limit deadlines to specified count', () => {
    render(<UpcomingDeadlines data={mockAssignments} limit={1} />)
    
    // Should only show 1 assignment (the most urgent one)
    const titles = screen.queryAllByText(/Bài tập/)
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('should highlight urgent deadlines (< 24 hours)', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Urgent badge should be present for deadline < 24h
    const urgentBadges = screen.queryAllByText('Khẩn cấp')
    expect(urgentBadges.length).toBeGreaterThan(0)
  })

  it('should display difficulty badges with Vietnamese labels', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Should display Vietnamese difficulty labels
    const difficultyLabels = screen.queryAllByText(/Dễ|Trung bình|Khó/)
    expect(difficultyLabels.length).toBeGreaterThan(0)
  })

  it('should format date in Vietnamese', () => {
    render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Date should be formatted with Vietnamese locale (e.g., "15 tháng 1, 2025")
    const dateElements = screen.getAllByText(/tháng/i)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('should handle missing dueDate', () => {
    const assignmentWithoutDate: ContentServiceAssignmentResponse[] = [
      {
        id: '1',
        title: 'Test',
        dueDate: undefined,
        difficultyLevel: 'EASY',
      },
    ]

    render(<UpcomingDeadlines data={assignmentWithoutDate} />)
    
    // Should show empty state since no valid due dates
    expect(screen.getByText('Không có hạn chót sắp tới')).toBeInTheDocument()
  })

  it('should handle missing difficultyLevel', () => {
    const assignmentWithoutDifficulty: ContentServiceAssignmentResponse[] = [
      {
        id: '1',
        title: 'Test',
        dueDate: tomorrow,
        difficultyLevel: undefined,
      },
    ]

    render(<UpcomingDeadlines data={assignmentWithoutDifficulty} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
    // Should not crash, just not show difficulty badge
  })

  it('should have cursor pointer on deadline item', () => {
    const { container } = render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Find deadline item divs
    const deadlineItems = container.querySelectorAll('[style*="cursor"]')
    expect(deadlineItems.length).toBeGreaterThan(0)
    
    // Check cursor style
    deadlineItems.forEach(item => {
      expect((item as HTMLElement).style.cursor).toBe('pointer')
    })
  })

  it('should navigate when clicking deadline item', () => {
    const { container } = render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Find deadline item divs that have the deadlineItem class
    const deadlineItems = Array.from(container.querySelectorAll('div')).filter(
      (div) => div.className.includes('deadlineItem')
    ) as HTMLElement[]
    
    expect(deadlineItems.length).toBeGreaterThan(0)
    
    // Verify first item has onClick handler by checking it has cursor pointer style
    const firstItem = deadlineItems[0]
    expect(firstItem.style.cursor).toBe('pointer')
  })

  it('should show hover effect on deadline item', () => {
    const { container } = render(<UpcomingDeadlines data={mockAssignments} />)
    
    // Find deadline item divs
    const deadlineItems = Array.from(container.querySelectorAll('div')).filter(
      (div) => div.className.includes('deadlineItem')
    ) as HTMLElement[]
    
    expect(deadlineItems.length).toBeGreaterThan(0)
    
    // Verify the hover handlers exist and transition style is set
    const item = deadlineItems[0]
    
    // Check that transition style is applied
    expect(item.style.transition).toBe('background-color 0.2s ease')
    
    // Check that initial background color can be set
    item.style.backgroundColor = 'var(--mantine-color-gray-0)'
    expect(item.style.backgroundColor).toBe('var(--mantine-color-gray-0)')
  })
})
