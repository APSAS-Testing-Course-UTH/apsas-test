/**
 * Skill Badges Component
 * Displays related skills as badges
 * Vietnamese labels throughout
 */

import { Badge, Group, Stack, Text } from '@mantine/core'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

interface SkillBadgesProps {
  skills?: ContentServiceSkillResponse[]
}

const labels = {
  skills: 'Kỹ năng',
  noSkills: 'Không có kỹ năng liên quan',
}

export function SkillBadges({ skills }: SkillBadgesProps) {
  if (!skills || skills.length === 0) {
    return (
      <Stack gap="md">
        <Text fw={600} size="lg">
          {labels.skills}
        </Text>
        <Text c="dimmed" size="sm">
          {labels.noSkills}
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md" className="skill-badges">
      <Text fw={600} size="lg">
        {labels.skills}
      </Text>
      <Group gap="xs" wrap="wrap">
        {skills.map((skill) => (
          <Badge
            key={skill.id}
            variant="light"
            color="blue"
            size="lg"
            title={skill.description}
            style={{ cursor: 'pointer' }}
            component="a"
            href={`/student/resources/skills/${skill.id}`}
          >
            {skill.name}
          </Badge>
        ))}
      </Group>
    </Stack>
  )
}
