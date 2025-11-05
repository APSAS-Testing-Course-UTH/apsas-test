import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { CalendarWidget } from './CalendarWidget'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

describe('CalendarWidget', () => {
  const mockAssignments: ContentServiceAssignmentResponse[] = [
    {
      id: '1',
      title: 'Bài tập 1',
      dueDate: new Date('2024-11-15'),
      description: 'Mô tả bài tập 1',
    } as ContentServiceAssignmentResponse,
    {
      id: '2',
      title: 'Bài tập 2',
      dueDate: new Date('2024-11-20'),
      description: 'Mô tả bài tập 2',
    } as ContentServiceAssignmentResponse,
    {
      id: '3',
      title: 'Bài tập 3',
      dueDate: new Date('2024-11-20'),
      description: 'Mô tả bài tập 3',
    } as ContentServiceAssignmentResponse,
  ]

  it('should render calendar widget with title', () => {
    render(<CalendarWidget assignments={[]} />)
    expect(screen.getByText('Lịch hạn chót')).toBeInTheDocument()
  })

  it('should show correct number of deadline days', () => {
    render(<CalendarWidget assignments={mockAssignments} />)
    expect(screen.getByText('2 ngày')).toBeInTheDocument()
  })

  it('should display correct day names', () => {
    render(<CalendarWidget assignments={[]} />)
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    dayNames.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it('should show initial instruction when no date selected', () => {
    render(<CalendarWidget assignments={mockAssignments} />)
    expect(screen.getByText('Chọn ngày để xem bài tập hạn chót')).toBeInTheDocument()
  })

  it('should handle empty assignments', () => {
    render(<CalendarWidget assignments={[]} />)
    expect(screen.getByText('Lịch hạn chót')).toBeInTheDocument()
    expect(screen.getByText('0 ngày')).toBeInTheDocument()
  })

  it('should render calendar days', () => {
    render(<CalendarWidget assignments={mockAssignments} />)
    // Day 1 should always be visible
    const buttons = screen.getAllByRole('button')
    // Find buttons with day numbers (exclude navigation buttons)
    const dayButtons = buttons.filter((btn) => {
      const text = btn.textContent
      return text && /^\d+$/.test(text)
    })
    expect(dayButtons.length).toBeGreaterThan(0)
  })

  it('should display calendar title with correct structure', () => {
    render(<CalendarWidget assignments={mockAssignments} />)
    const title = screen.getByText('Lịch hạn chót')
    expect(title).toBeInTheDocument()
    const badge = screen.getByText('2 ngày')
    expect(badge).toBeInTheDocument()
  })

  it('should render with loading state', () => {
    const { container } = render(<CalendarWidget isLoading={true} />)
    // When loading, Card with empty content is rendered
    // Skeleton component renders as a div, check if container has divs
    const cardElements = container.querySelectorAll('[class*="Card"]')
    expect(cardElements.length).toBeGreaterThan(0)
  })

  it('should map assignments by date correctly', () => {
    render(<CalendarWidget assignments={mockAssignments} />)
    // We have 3 assignments: 1 on Nov 15, 2 on Nov 20
    // So there should be 2 unique dates with assignments
    expect(screen.getByText('2 ngày')).toBeInTheDocument()
  })

  it('should format month name in Vietnamese', () => {
    const { rerender } = render(<CalendarWidget assignments={[]} />)
    // Current month should be displayed in Vietnamese
    const currentDate = new Date()
    const monthName = currentDate.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getByText(monthName)).toBeInTheDocument()

    rerender(<CalendarWidget assignments={[]} />)
  })

  it('should have cursor pointer on assignment item', () => {
    const { container } = render(<CalendarWidget assignments={mockAssignments} />)
    
    // Click on calendar day 15
    const buttons = screen.getAllByRole('button').filter(btn => btn.textContent?.trim() === '15')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      
      // Find assignment box and verify cursor style
      const assignmentBoxes = container.querySelectorAll('[style*="cursor"]')
      expect(assignmentBoxes.length).toBeGreaterThan(0)
    }
  })
})
