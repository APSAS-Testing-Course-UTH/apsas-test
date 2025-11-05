/**
 * Skill Progress Component
 * Displays skill-based progress with progress bars
 */

import { Paper, Stack, Group, Text, Progress, Badge, ThemeIcon } from '@mantine/core'
import { IconTrendingUp, IconTarget } from '@tabler/icons-react'
import type { SkillProgress } from '../types'
import { PERFORMANCE_LABELS } from '../types'
import styles from './SkillProgress.module.css'

interface SkillProgressProps {
  skillProgress: SkillProgress[]
  isLoading?: boolean
}

export function SkillProgressComponent({ skillProgress, isLoading = false }: SkillProgressProps) {
  if (isLoading) {
    return (
      <Paper className={styles.container} p="md">
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </Stack>
      </Paper>
    )
  }

  if (!skillProgress.length) {
    return (
      <Paper className={styles.container} p="md">
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {PERFORMANCE_LABELS.noData}
        </Text>
      </Paper>
    )
  }

  return (
    <Paper className={styles.container} p="md">
      <Stack gap="md">
        <div className={styles.header}>
          <Group gap="sm">
            <ThemeIcon variant="light" size="lg" radius="md">
              <IconTarget size={18} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              {PERFORMANCE_LABELS.skillProgress}
            </Text>
          </Group>
        </div>

        <Stack gap="lg">
          {skillProgress.map((skill) => (
            <div key={skill.skillId} className={styles.skillItem}>
              <Group justify="space-between" mb="xs">
                <Group gap="xs" flex={1}>
                  <ThemeIcon
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'purple' }}
                    size="sm"
                    radius="md"
                  >
                    <IconTrendingUp size={14} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500} size="sm">
                      {skill.skillName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {skill.passCount}/{skill.attemptCount} lần đạt
                    </Text>
                  </div>
                </Group>
                <Badge
                  color={skill.progressPercentage >= 70 ? 'green' : skill.progressPercentage >= 40 ? 'yellow' : 'red'}
                  variant="light"
                  size="lg"
                >
                  {skill.progressPercentage}%
                </Badge>
              </Group>

              <Progress
                value={skill.progressPercentage}
                color={skill.progressPercentage >= 70 ? 'green' : skill.progressPercentage >= 40 ? 'yellow' : 'red'}
                size="md"
                radius="md"
              />

              {skill.lastAttemptDate && (
                <Text size="xs" c="dimmed" mt="xs">
                  Lần cuối: {new Date(skill.lastAttemptDate).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </div>
          ))}
        </Stack>

        <div className={styles.summary}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Tổng kỹ năng: {skillProgress.length}
            </Text>
            <Text size="sm" c="dimmed">
              Đạt trung bình:{' '}
              {Math.round(
                skillProgress.reduce((acc, s) => acc + s.progressPercentage, 0) /
                  skillProgress.length
              )}
              %
            </Text>
          </Group>
        </div>
      </Stack>
    </Paper>
  )
}
