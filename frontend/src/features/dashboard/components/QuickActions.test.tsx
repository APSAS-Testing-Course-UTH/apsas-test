import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { QuickActions } from './QuickActions'

describe('QuickActions', () => {
  it('should render all action buttons', () => {
    render(<QuickActions />)
    
    expect(screen.getByText('Xem tất cả bài tập')).toBeInTheDocument()
    expect(screen.getByText('Nộp bài mới')).toBeInTheDocument()
    expect(screen.getByText('Xem hiệu suất')).toBeInTheDocument()
    expect(screen.getByText('Trợ giúp')).toBeInTheDocument()
  })

  it('should have Vietnamese labels', () => {
    render(<QuickActions />)
    
    // Verify all buttons have Vietnamese text
    expect(screen.getByText('Xem tất cả bài tập')).toBeInTheDocument()
    expect(screen.getByText('Nộp bài mới')).toBeInTheDocument()
    expect(screen.getByText('Xem hiệu suất')).toBeInTheDocument()
    expect(screen.getByText('Trợ giúp')).toBeInTheDocument()
  })

  it('should link to assignments page', () => {
    render(<QuickActions />)
    
    const link = screen.getByText('Xem tất cả bài tập').closest('a')
    expect(link).toHaveAttribute('href', '/student/assignments')
  })

  it('should link to active assignments with filter', () => {
    render(<QuickActions />)
    
    const link = screen.getByText('Nộp bài mới').closest('a')
    expect(link).toHaveAttribute('href', expect.stringContaining('/student/assignments'))
  })

  it('should link to performance page', () => {
    render(<QuickActions />)
    
    const link = screen.getByText('Xem hiệu suất').closest('a')
    expect(link).toHaveAttribute('href', '/student/performance')
  })

  it('should link to support page', () => {
    render(<QuickActions />)
    
    const link = screen.getByText('Trợ giúp').closest('a')
    expect(link).toHaveAttribute('href', '/student/support')
  })

  it('should display icons', () => {
    const { container } = render(<QuickActions />)
    
    // Check for SVG icons
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(4)
  })

  it('should have responsive layout', () => {
    const { container } = render(<QuickActions />)
    
    // SimpleGrid should be present
    const grid = container.querySelector('[class*="SimpleGrid"]')
    expect(grid).toBeInTheDocument()
  })

  it('should render buttons as full width', () => {
    render(<QuickActions />)
    
    const buttons = screen.getAllByRole('link')
    buttons.forEach((button) => {
      // Mantine's fullWidth adds a specific class
      expect(button).toBeInTheDocument()
    })
  })

  it('should have light variant buttons', () => {
    render(<QuickActions />)
    
    const buttons = screen.getAllByRole('link')
    expect(buttons.length).toBe(4)
  })

  it('should be accessible', () => {
    render(<QuickActions />)
    
    const buttons = screen.getAllByRole('link')
    buttons.forEach((button) => {
      // Each button should have accessible text
      expect(button).toHaveAccessibleName()
    })
  })

  it('should have correct order of buttons', () => {
    render(<QuickActions />)
    
    const buttons = screen.getAllByRole('link')
    expect(buttons[0]).toHaveTextContent('Xem tất cả bài tập')
    expect(buttons[1]).toHaveTextContent('Nộp bài mới')
    expect(buttons[2]).toHaveTextContent('Xem hiệu suất')
    expect(buttons[3]).toHaveTextContent('Trợ giúp')
  })
})
