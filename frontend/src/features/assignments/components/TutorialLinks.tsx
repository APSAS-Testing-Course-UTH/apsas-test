/**
 * Tutorial Links Component
 * Displays related learning resources as links
 * Vietnamese labels throughout
 */

import { Stack, Text, List, ThemeIcon, Button } from '@mantine/core'
import { IconBook } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { ContentServiceTutorialResponse } from '@/api/types.gen'

interface TutorialLinksProps {
  tutorials?: ContentServiceTutorialResponse[]
}

const labels = {
  tutorials: 'Tài liệu học tập',
  noTutorials: 'Không có tài liệu học tập',
}

export function TutorialLinks({ tutorials }: TutorialLinksProps) {
  const navigate = useNavigate()

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
          <List.Item key={tutorial.id || 'unknown'}>
            <Button
              variant="subtle"
              onClick={() =>
                tutorial.id &&
                navigate({
                  to: '/student/resources/tutorials/$id',
                  params: { id: tutorial.id },
                })
              }
              title={tutorial.content}
              disabled={!tutorial.id}
            >
              {tutorial.title}
            </Button>
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}
