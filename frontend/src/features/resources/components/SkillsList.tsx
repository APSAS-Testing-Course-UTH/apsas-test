/**
 * SkillsList Component
 * 
 * Displays a grid of skills with:
 * - Loading states
 * - Error handling
 * - Empty state
 * - Pagination support
 * - Vietnamese UI
 */

import { Grid, Stack, Text, Alert, Button, Group, Center, Pagination } from '@mantine/core'
import { IconAlertCircle, IconBox } from '@tabler/icons-react'
import { SkillCard } from './SkillCard'
import type { ContentServiceSkillResponse } from '@/api/types.gen'

/**
 * Vietnamese UI labels
 */
const labels = {
  title: 'Kỹ năng',
  loading: 'Đang tải kỹ năng...',
  empty: 'Chưa có kỹ năng nào',
  error: 'Có lỗi xảy ra khi tải kỹ năng',
  retry: 'Thử lại',
  page: 'Trang',
  showingResults: 'Đang hiển thị',
  of: 'trong',
  skills: 'kỹ năng',
}

/**
 * Props for SkillsList component
 */
export interface SkillsListProps {
  /** Array of skills to display */
  skills: ContentServiceSkillResponse[]
  /** Whether data is loading */
  isLoading: boolean
  /** Error object if fetch failed */
  error: Error | null
  /** Total number of pages */
  totalPages: number
  /** Current page number (1-indexed) */
  currentPage: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback to refresh data */
  onRefresh: () => void
  /** Optional callback when skill card is clicked */
  onSelectSkill?: (skill: ContentServiceSkillResponse) => void
}

/**
 * Skeleton loader for skill cards
 */
function SkillCardSkeleton() {
  return (
    <div style={{
      borderRadius: 'var(--mantine-radius-md)',
      border: '1px solid var(--mantine-color-gray-2)',
      height: '180px',
      backgroundColor: 'var(--mantine-color-gray-1)',
      animation: 'pulse 2s infinite',
    }} />
  )
}

/**
 * SkillsList Component
 * 
 * Displays skills in a responsive grid with pagination
 */
export function SkillsList({ 
  skills,
  isLoading,
  error,
  totalPages,
  currentPage,
  onPageChange,
  onRefresh,
  onSelectSkill,
}: SkillsListProps) {
  const pageSize = skills.length // Calculate based on actual data

  // Loading state - show skeleton loaders
  if (isLoading) {
    return (
      <Stack gap="lg">
        <Grid gutter="md">
          {Array.from({ length: Math.min(12, pageSize || 10) }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <SkillCardSkeleton />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    )
  }

  // Error state
  if (error) {
    return (
      <Stack gap="md">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title={labels.error}
          color="red"
          variant="light"
        >
          {error instanceof Error ? error.message : labels.error}
        </Alert>

        <Button onClick={onRefresh}>
          {labels.retry}
        </Button>
      </Stack>
    )
  }

  // Empty state
  if (skills.length === 0) {
    return (
      <Stack gap="md" align="center" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <IconBox size={48} opacity={0.5} />
            <Text c="dimmed" ta="center">
              {labels.empty}
            </Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  // Render skills grid
  return (
    <Stack gap="lg">
      {/* Skills grid */}
      <Grid gutter="md">
        {skills.map((skill) => (
          <Grid.Col key={skill.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <SkillCard
              skill={skill}
              onViewDetails={() => {
                if (onSelectSkill) {
                  onSelectSkill(skill)
                }
              }}
            />
          </Grid.Col>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
            size="sm"
          />
        </Group>
      )}
    </Stack>
  )
}
