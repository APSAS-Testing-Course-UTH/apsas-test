/**
 * Instructor Submissions List Component
 *
 * Displays paginated list of submissions with:
 * - Student name and email
 * - Submission status
 * - Test results summary
 * - Feedback status
 * - Client-side filtering
 * - Actions (view details, provide feedback)
 */

import { useState, useMemo } from 'react'
import { Table, Pagination, Badge, Button, Group, Stack, Text, Center, Loader, Alert } from '@mantine/core'
import { IconEye, IconMessageCircle } from '@tabler/icons-react'
import { useInstructorSubmissions } from '../api/useInstructorSubmissions'
import { useStudentsData } from '../api/useStudentData'
import { SubmissionsFilter, type SubmissionFilters } from './SubmissionsFilter'
import styles from './InstructorSubmissionsList.module.css'

interface InstructorSubmissionsListProps {
  assignmentId?: string
  onSelectSubmission?: (submissionId: string) => void
  onViewSubmission?: (submissionId: string) => void
  onProvideFeedback?: (submissionId: string) => void
}

/**
 * Display a paginated list of submissions for an assignment
 */
export function InstructorSubmissionsList({
  assignmentId,
  onSelectSubmission,
  onViewSubmission,
  onProvideFeedback,
}: InstructorSubmissionsListProps) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  
  // Filter state
  const [filters, setFilters] = useState<SubmissionFilters>({
    searchEmail: '',
    status: null,
    scoreMin: '',
    scoreMax: '',
    hasFeedback: null,
  })

  const { data, isLoading, error } = useInstructorSubmissions(
    assignmentId,
    page - 1,
    pageSize
  )
  
  // Fetch student data for all submissions
  // Extract student IDs from submissions content
  const studentIds = useMemo(() => {
    return data?.content?.map((s: any) => s.studentId).filter(Boolean) || []
  }, [data])
  
  const { studentMap, isLoading: studentsLoading } = useStudentsData(studentIds)
  
  // Enrich submissions with student data and calculated fields
  const enrichedSubmissions = useMemo(() => {
    const submissions = data?.content || []
    
    return submissions.map((sub: any) => {
      const student = studentMap.get(sub.studentId || '')
      
      // Calculate test case statistics from testCaseResults array
      const testTotal = sub.testCaseResults?.length || 0
      const testPassed = sub.testCaseResults?.filter((tc: any) => tc.passed).length || 0
      
      // Derive feedback status from feedback field
      const hasFeedback = !!(sub.feedback && sub.feedback.trim().length > 0)
      
      return {
        ...sub,
        // Student information from Identity Service
        studentName: student 
          ? `${student.firstName} ${student.lastName}` 
          : 'N/A',
        studentEmail: student?.email || 'N/A',
        // Calculated fields from Backend data
        testTotal,
        testPassed,
        hasFeedback,
      }
    })
  }, [data, studentMap])
  
  // Client-side filtering on enriched data
  const filteredSubmissions = useMemo(() => {
    return enrichedSubmissions.filter((submission: any) => {
      // Email search filter
      if (filters.searchEmail && 
          !submission.studentEmail?.toLowerCase().includes(filters.searchEmail.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (filters.status && submission.status !== filters.status) {
        return false
      }
      
      // Score range filter
      if (filters.scoreMin !== '' && submission.score !== undefined) {
        const minScore = typeof filters.scoreMin === 'number' ? filters.scoreMin : parseFloat(filters.scoreMin)
        if (submission.score < minScore) {
          return false
        }
      }
      
      if (filters.scoreMax !== '' && submission.score !== undefined) {
        const maxScore = typeof filters.scoreMax === 'number' ? filters.scoreMax : parseFloat(filters.scoreMax)
        if (submission.score > maxScore) {
          return false
        }
      }
      
      // Feedback filter
      if (filters.hasFeedback) {
        const hasFeedback = submission.feedback && submission.feedback.trim().length > 0
        if (filters.hasFeedback === 'yes' && !hasFeedback) {
          return false
        }
        if (filters.hasFeedback === 'no' && hasFeedback) {
          return false
        }
      }
      
      return true
    })
  }, [enrichedSubmissions, filters])

  if (isLoading || studentsLoading) {
    return (
      <Center py={40}>
        <Stack align="center">
          <Loader />
          <Text c="dimmed">Đang tải danh sách bài nộp...</Text>
        </Stack>
      </Center>
    )
  }

  if (error) {
    return (
      <Stack gap="md">
        <SubmissionsFilter filters={filters} onFiltersChange={setFilters} />
        <Alert icon={<span>❌</span>} color="red" title="Lỗi">
          Không thể tải danh sách bài nộp. Vui lòng thử lại sau.
        </Alert>
      </Stack>
    )
  }

  if (filteredSubmissions.length === 0 && !isLoading) {
    const hasFilters = filters.searchEmail || filters.status || 
                      filters.scoreMin !== '' || filters.scoreMax !== '' ||
                      filters.hasFeedback
    
    return (
      <Stack gap="md">
        <SubmissionsFilter filters={filters} onFiltersChange={setFilters} />
        <Center py={40}>
          <Stack align="center">
            <Text size="lg">
              {hasFilters ? '🔍 Không tìm thấy bài nộp phù hợp' : 'Chưa có bài nộp nào'}
            </Text>
            <Text c="dimmed">
              {hasFilters ? 'Thử thay đổi bộ lọc để xem kết quả khác' : 'Sinh viên chưa nộp bài cho bài tập này'}
            </Text>
          </Stack>
        </Center>
      </Stack>
    )
  }

  const totalPages = data?.totalPages || 1

  return (
    <Stack gap="md">
      <SubmissionsFilter filters={filters} onFiltersChange={setFilters} />
      
      <div className={styles.container}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Học sinh</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Test Passed</Table.Th>
            <Table.Th>Điểm</Table.Th>
            <Table.Th>Phản hồi</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredSubmissions.map((submission: any) => (
            <Table.Tr key={submission.id}>
              <Table.Td>
                <Text fw={500}>
                  {submission.studentName || submission.studentId || 'N/A'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {submission.studentEmail || 'N/A'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={
                    submission.status === 'EVALUATED'
                      ? 'green'
                      : submission.status === 'FAILED'
                        ? 'red'
                        : 'blue'
                  }
                >
                  {submission.status === 'EVALUATED'
                    ? 'Đã chấm'
                    : submission.status === 'FAILED'
                      ? 'Không đạt'
                      : 'Chưa chấm'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge variant="light">
                  {submission.testPassed || 0} / {submission.testTotal || 0}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text fw={500} c={submission.score >= 70 ? 'green' : 'orange'}>
                  {submission.score || 0}%
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  variant="dot"
                  color={submission.hasFeedback ? 'green' : 'gray'}
                >
                  {submission.hasFeedback ? '✅ Có' : '❌ Không'}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap={4}>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEye size={14} />}
                    onClick={() =>
                      (onViewSubmission ?? onSelectSubmission)?.(submission.id)
                    }
                  >
                    Xem chi tiết
                  </Button>
                  {!submission.hasFeedback && (
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      leftSection={<IconMessageCircle size={14} />}
                      onClick={() =>
                        (onProvideFeedback ?? onSelectSubmission)?.(
                          submission.id
                        )
                      }
                    >
                      Phản hồi
                    </Button>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt={20}>
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            size="sm"
          />
        </Group>
      )}
      </div>
    </Stack>
  )
}
