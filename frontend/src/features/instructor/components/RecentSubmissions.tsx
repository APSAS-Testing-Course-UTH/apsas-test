/**
 * Recent Submissions Section
 * Vietnamese: Bài nộp gần đây cần chấm
 * 
 * Displays a list of recent submissions pending evaluation
 */

import {
  Card,
  Stack,
  Table,
  Text,
  Button,
  Badge,
  Group,
  Skeleton,
  Title,
} from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import type { RecentSubmissionSummary } from '../types/instructor.types'

export interface RecentSubmissionsProps {
  submissions: RecentSubmissionSummary[] | undefined
  isLoading: boolean
  limit?: number
}

export function RecentSubmissions({ submissions, isLoading, limit = 5 }: RecentSubmissionsProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card withBorder shadow="sm" p="md" radius="md" h="100%" style={{ minHeight: '360px' }}>
        <Stack gap="sm" h="100%">
          <Title order={3}>Bài nộp gần đây cần chấm</Title>
          <Skeleton height="100%" radius="md" />
        </Stack>
      </Card>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card withBorder shadow="sm" p="md" radius="md" h="100%" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
        <Stack gap="sm" h="100%">
          <Title order={3}>Bài nộp gần đây cần chấm</Title>
          <Stack flex={1} justify="center" align="center">
            <Text c="dimmed" size="sm" ta="center">
              Không có bài nộp nào cần chấm
            </Text>
          </Stack>
        </Stack>
      </Card>
    )
  }

  return (
    <Card withBorder shadow="sm" p="md" radius="md" h="100%" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
      <Stack gap="sm" h="100%">
        <Group justify="space-between">
          <Title order={3}>Bài nộp gần đây cần chấm</Title>
          <Button
            variant="subtle"
            size="xs"
            rightSection={<IconArrowRight size={14} />}
            onClick={() => navigate({ to: '/instructor/submissions' })}
          >
            Xem tất cả
          </Button>
        </Group>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Sinh viên</Table.Th>
              <Table.Th>Bài tập</Table.Th>
              <Table.Th>Nộp lúc</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.slice(0, limit).map((submission) => (
              <Table.Tr key={submission.submissionId}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {submission.studentName}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{submission.assignmentTitle}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      submission.status === 'PENDING'
                        ? 'orange'
                        : submission.status === 'EVALUATED'
                          ? 'green'
                          : 'red'
                    }
                    variant="light"
                  >
                    {submission.status === 'PENDING' && 'Chờ chấm'}
                    {submission.status === 'EVALUATED' && 'Đã chấm'}
                    {submission.status === 'RETURNED' && 'Trả về'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    onClick={() =>
                      navigate({
                        to: '/instructor/submissions/$id',
                        params: { id: submission.submissionId },
                      })
                    }
                  >
                    Xem & Chấm
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        </div>
      </Stack>
    </Card>
  )
}
