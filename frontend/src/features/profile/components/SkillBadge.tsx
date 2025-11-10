/**
 * SkillBadge Component
 * Displays a single skill as a styled badge with description tooltip
 */

import { Badge, Tooltip, Group } from '@mantine/core'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

interface SkillBadgeProps {
  skill: ContentServiceSkillResponse
  variant?: 'light' | 'filled' | 'outline' | 'dot'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: string
  onClick?: (skillId: string) => void
  interactive?: boolean
}

/**
 * Single skill badge component
 * 
 * Vietnamese labels:
 * - Shows skill name as badge text
 * - Shows description as tooltip on hover
 * 
 * Features:
 * - Customizable variant, size, color
 * - Optional click handler for selection
 * - Tooltip with description
 * - Interactive cursor on hover if clickable
 * 
 * @param skill - Skill data (id, name, description)
 * @param variant - Badge style variant
 * @param size - Badge size
 * @param color - Badge color
 * @param onClick - Callback when skill is clicked
 * @param interactive - Show interactive cursor
 */
export function SkillBadge({
  skill,
  variant = 'light',
  size = 'md',
  color = 'blue',
  onClick,
  interactive = false,
}: SkillBadgeProps) {
  const badge = (
    <Badge
      variant={variant}
      color={color}
      size={size}
      onClick={() => onClick?.(skill.id!)}
      style={{
        cursor: interactive || onClick ? 'pointer' : 'default',
      }}
    >
      {skill.name}
    </Badge>
  )

  // Wrap with tooltip if description exists
  if (skill.description) {
    return <Tooltip label={skill.description}>{badge}</Tooltip>
  }

  return badge
}
