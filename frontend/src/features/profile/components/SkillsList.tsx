/**
 * SkillsList Component
 * Displays a list or grid of available programming skills
 * Vietnamese labels throughout
 */

import { Stack, Group, Text, Loader, Alert, Paper, SimpleGrid } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useSkillsList } from '../api/skillsHooks'
import { SkillBadge } from './SkillBadge'

interface SkillsListProps {
  /** Display mode: 'grid' or 'list' */
  displayMode?: 'grid' | 'list'
  /** Columns for grid layout */
  gridCols?: number
  /** Allow selecting skills */
  selectable?: boolean
  /** Callback when skill is selected */
  onSelectSkill?: (skillId: string) => void
  /** Initially selected skill IDs */
  selectedSkillIds?: string[]
}

const labels = {
  title: 'Danh sách kỹ năng',
  loading: 'Đang tải danh sách kỹ năng...',
  error: 'Lỗi khi tải danh sách kỹ năng',
  empty: 'Không có kỹ năng nào',
  total: 'Tổng cộng',
}

/**
 * SkillsList Component
 * 
 * Fetches and displays available programming skills
 * Supports grid and list display modes
 * Optional skill selection capability
 * 
 * Features:
 * - Fetch skills from API using useSkillsList hook
 * - Grid or list display modes
 * - Skill descriptions as tooltips
 * - Optional selection with visual feedback
 * - Loading and error states
 * - Empty state handling
 * - Vietnamese UI labels
 * 
 * @param displayMode - How to display skills ('grid' or 'list')
 * @param gridCols - Number of columns for grid layout
 * @param selectable - Allow selecting skills
 * @param onSelectSkill - Callback when skill selected
 * @param selectedSkillIds - Initially selected skill IDs
 */
export function SkillsList({
  displayMode = 'grid',
  gridCols = 4,
  selectable = false,
  onSelectSkill,
  selectedSkillIds = [],
}: SkillsListProps) {
  const { skills, isLoading, error } = useSkillsList()
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedSkillIds))

  // Handle skill selection
  const handleSelectSkill = (skillId: string) => {
    if (!selectable) return

    const newSelected = new Set(selected)
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId)
    } else {
      newSelected.add(skillId)
    }
    setSelected(newSelected)
    onSelectSkill?.(skillId)
  }

  // Loading state
  if (isLoading) {
    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">{labels.loading}</Text>
        </Stack>
      </Paper>
    )
  }

  // Error state
  if (error) {
    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Lỗi"
          color="red"
          variant="light"
        >
          {labels.error}
        </Alert>
      </Paper>
    )
  }

  // Empty state
  if (!skills || skills.length === 0) {
    return (
      <Paper p="xl" shadow="sm" radius="md" withBorder>
        <Stack align="center" gap="sm">
          <Text c="dimmed">{labels.empty}</Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Text fw={600} size="lg">
          {labels.title}
        </Text>
        <Text size="sm" c="dimmed">
          {labels.total}: {skills.length}
        </Text>
      </Group>

      {/* Skills display */}
      {displayMode === 'grid' ? (
        <SimpleGrid cols={{ base: 2, sm: 3, md: gridCols }} spacing="md">
          {skills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => handleSelectSkill(skill.id!)}
              style={{
                padding: selectable && selected.has(skill.id!) ? '8px' : '0px',
                backgroundColor: selectable && selected.has(skill.id!) ? '#e7f5ff' : 'transparent',
                borderRadius: '8px',
                border: selectable && selected.has(skill.id!) ? '2px solid #1971c2' : 'none',
                cursor: selectable ? 'pointer' : 'default',
              }}
            >
              <SkillBadge
                skill={skill}
                interactive={selectable}
                color={selected.has(skill.id!) ? 'blue' : 'gray'}
                variant={selected.has(skill.id!) ? 'filled' : 'light'}
              />
            </div>
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="sm">
          {skills.map((skill) => (
            <Paper
              key={skill.id}
              p="md"
              radius="md"
              withBorder
              onClick={() => handleSelectSkill(skill.id!)}
              style={{
                cursor: selectable ? 'pointer' : 'default',
                backgroundColor: selected.has(skill.id!) ? '#e7f5ff' : 'transparent',
                borderColor: selected.has(skill.id!) ? '#1971c2' : undefined,
              }}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={500}>{skill.name}</Text>
                  {skill.description && (
                    <Text size="sm" c="dimmed">
                      {skill.description}
                    </Text>
                  )}
                </div>
                {selectable && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: selected.has(skill.id!) ? '#1971c2' : 'transparent',
                    }}
                  />
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
