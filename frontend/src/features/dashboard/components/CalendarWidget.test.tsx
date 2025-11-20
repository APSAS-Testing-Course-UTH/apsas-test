import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test-utils'
import { CalendarWidget } from './CalendarWidget'
import type { ContentServiceAssignmentResponse } from '@/api/types.gen'

const SYSTEM_DATE = new Date('2025-11-17T09:00:00Z')

const buildAssignment = (overrides: Partial<ContentServiceAssignmentResponse>): ContentServiceAssignmentResponse => ({
  id: 'assignment-id',
  title: 'Bài tập mẫu',
  dueDate: new Date('2025-11-20T02:00:00Z'),
  description: 'Mô tả',
  ...overrides,
} as ContentServiceAssignmentResponse)

describe('CalendarWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: SYSTEM_DATE })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders calendar header and current month label', () => {
    render(<CalendarWidget assignments={[]} />)
    expect(screen.getByText('Lịch theo tháng')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /november 2025/i })).toBeInTheDocument()
  })

  it('shows empty-state message when no date is selected', () => {
    render(<CalendarWidget assignments={[buildAssignment({ dueDate: new Date('2025-11-20T02:00:00Z') })]} />)
    expect(screen.getByText('Chọn ngày để xem bài tập hạn chót')).toBeInTheDocument()
  })

  it('auto-selects current day when it has deadlines', () => {
    render(<CalendarWidget assignments={[buildAssignment({ dueDate: SYSTEM_DATE })]} />)

    expect(screen.getByText('Bài tập hạn chót (1)')).toBeInTheDocument()
    expect(screen.getByText('Bài tập mẫu')).toBeInTheDocument()
  })

  it('allows selecting another date to view assignments', () => {
    const assignments: ContentServiceAssignmentResponse[] = [
      buildAssignment({ id: 'first', dueDate: new Date('2025-11-18T02:00:00Z'), title: 'Bài tập 18' }),
    ]

    render(<CalendarWidget assignments={assignments} />)

    // Click on day 18
    const dayButton = screen.getByRole('button', { name: /18 november 2025/i })
    fireEvent.click(dayButton)

    expect(screen.getByText('Bài tập 18')).toBeInTheDocument()
  })
})
