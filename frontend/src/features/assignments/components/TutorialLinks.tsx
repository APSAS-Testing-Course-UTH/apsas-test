/**
 * Tutorial Links Component
 * Displays related learning resources as links
 * Vietnamese labels throughout
 */

import { Stack, Text, List, ThemeIcon, Anchor } from '@mantine/core'
import { IconBook } from '@tabler/icons-react'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

interface TutorialLinksProps {
  tutorials?: ContentServiceTutorialResponse[]
}

const labels = {
  tutorials: 'Tài liệu học tập',
  noTutorials: 'Không có tài liệu học tập',
}

export function TutorialLinks({ tutorials }: TutorialLinksProps) {
  if (!tutorials || tutorials.length === 0) {
    return (
      <Stack gap="md">
        <Text fw={600} size="lg">
          {labels.tutorials}
        </Text>
        <Text c="dimmed" size="sm">
          {labels.noTutorials}
        </Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md" className="tutorial-links">
      <Text fw={600} size="lg">
        {labels.tutorials}
      </Text>
      <List
        spacing="xs"
        size="md"
        center
        icon={
          <ThemeIcon color="blue" size={24} radius="md">
            <IconBook size={16} />
          </ThemeIcon>
        }
      >
        {tutorials.map((tutorial) => (
          <List.Item key={tutorial.id}>
            <Anchor
              href={`#tutorial/${tutorial.id}`}
              title={tutorial.content}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tutorial.title}
            </Anchor>
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}
