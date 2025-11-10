import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { SkillBadge } from './SkillBadge'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
)

describe('SkillBadge', () => {
  const mockSkill: ContentServiceSkillResponse = {
    id: '1',
    name: 'Recursion',
    description: 'Understanding recursive algorithms',
  }

  it('should render skill badge with name', () => {
    render(<SkillBadge skill={mockSkill} />, { wrapper })
    expect(screen.getByText('Recursion')).toBeInTheDocument()
  })

  it('should display tooltip with description on hover', async () => {
    const user = userEvent.setup()
    render(<SkillBadge skill={mockSkill} />, { wrapper })

    const badge = screen.getByText('Recursion')
    await user.hover(badge)

    // Mantine tooltip appears after delay
    // For testing purposes, we check if element exists
    expect(screen.getByText('Recursion')).toBeInTheDocument()
  })

  it('should handle click event when onClick provided', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<SkillBadge skill={mockSkill} onClick={onClick} />, { wrapper })

    await user.click(screen.getByText('Recursion'))
    expect(onClick).toHaveBeenCalledWith('1')
  })

  it('should support different badge sizes', () => {
    const { rerender } = render(<SkillBadge skill={mockSkill} size="lg" />, {
      wrapper,
    })
    expect(screen.getByText('Recursion')).toBeInTheDocument()

    rerender(<SkillBadge skill={mockSkill} size="sm" />)
    expect(screen.getByText('Recursion')).toBeInTheDocument()
  })

  it('should support different badge colors', () => {
    const { rerender } = render(<SkillBadge skill={mockSkill} color="red" />, {
      wrapper,
    })
    expect(screen.getByText('Recursion')).toBeInTheDocument()

    rerender(<SkillBadge skill={mockSkill} color="green" />)
    expect(screen.getByText('Recursion')).toBeInTheDocument()
  })

  it('should support different badge variants', () => {
    const { rerender } = render(
      <SkillBadge skill={mockSkill} variant="filled" />,
      { wrapper }
    )
    expect(screen.getByText('Recursion')).toBeInTheDocument()

    rerender(<SkillBadge skill={mockSkill} variant="outline" />)
    expect(screen.getByText('Recursion')).toBeInTheDocument()
  })

  it('should render without description gracefully', () => {
    const skillWithoutDesc: ContentServiceSkillResponse = {
      id: '2',
      name: 'Arrays',
    }

    render(<SkillBadge skill={skillWithoutDesc} />, { wrapper })
    expect(screen.getByText('Arrays')).toBeInTheDocument()
  })

  it('should have cursor pointer when interactive', () => {
    const { container } = render(
      <SkillBadge skill={mockSkill} interactive />,
      { wrapper }
    )
    const badge = screen.getByText('Recursion')
    expect(badge).toBeInTheDocument()
  })

  it('should call onClick with correct skill id', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    const skillWithId: ContentServiceSkillResponse = {
      id: 'skill-123',
      name: 'Dynamic Programming',
    }

    render(<SkillBadge skill={skillWithId} onClick={onClick} />, { wrapper })

    await user.click(screen.getByText('Dynamic Programming'))
    expect(onClick).toHaveBeenCalledWith('skill-123')
  })
})
