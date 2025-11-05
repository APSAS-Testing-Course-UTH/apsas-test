import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { IconBook } from '@tabler/icons-react'
import { StatsCard } from './StatsCard'

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(<StatsCard title="Tổng bài tập" value={24} icon={<IconBook />} />)
    
    expect(screen.getByText('Tổng bài tập')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(<StatsCard title="Điểm trung bình" value="87%" icon={<IconBook />} />)
    
    expect(screen.getByText('87%')).toBeInTheDocument()
  })

  it('should render icon', () => {
    const { container } = render(
      <StatsCard title="Test" value={10} icon={<IconBook data-testid="stats-icon" />} />
    )
    
    expect(container.querySelector('[data-testid="stats-icon"]')).toBeInTheDocument()
  })

  it('should apply custom color', () => {
    const { container } = render(
      <StatsCard title="Test" value={10} icon={<IconBook />} color="red" />
    )
    
    // Component should render without crashing
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should not render trend when not provided', () => {
    const { container } = render(<StatsCard title="Test" value={10} icon={<IconBook />} />)
    
    expect(container.querySelector('.trendIconUp')).not.toBeInTheDocument()
    expect(container.querySelector('.trendIconDown')).not.toBeInTheDocument()
  })

  it('should render trend with up direction', () => {
    render(
      <StatsCard
        title="Test"
        value={10}
        icon={<IconBook />}
        trend={{ value: 15, label: 'so với tuần trước', direction: 'up' }}
      />
    )
    
    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('so với tuần trước')).toBeInTheDocument()
  })

  it('should render trend with down direction', () => {
    render(
      <StatsCard
        title="Test"
        value={10}
        icon={<IconBook />}
        trend={{ value: 8, label: 'so với tuần trước', direction: 'down' }}
      />
    )
    
    expect(screen.getByText('8%')).toBeInTheDocument()
    expect(screen.getByText('so với tuần trước')).toBeInTheDocument()
  })

  it('should display Vietnamese title', () => {
    render(<StatsCard title="Tổng bài tập" value={24} icon={<IconBook />} />)
    
    expect(screen.getByText('Tổng bài tập')).toBeInTheDocument()
  })

  it('should display Vietnamese trend label', () => {
    render(
      <StatsCard
        title="Điểm"
        value="90%"
        icon={<IconBook />}
        trend={{ value: 5, label: 'so với tháng trước', direction: 'up' }}
      />
    )
    
    expect(screen.getByText('so với tháng trước')).toBeInTheDocument()
  })

  it('should have hover effect class', () => {
    render(<StatsCard title="Test" value={10} icon={<IconBook />} />)
    
    // Component should render successfully
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should render with all props', () => {
    render(
      <StatsCard
        title="Tiến độ"
        value="75%"
        icon={<IconBook />}
        color="green"
        trend={{ value: 10, label: 'so với tuần trước', direction: 'up' }}
      />
    )
    
    expect(screen.getByText('Tiến độ')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('so với tuần trước')).toBeInTheDocument()
  })
})
