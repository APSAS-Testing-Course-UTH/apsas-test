import React, { useState } from 'react'
import { Table, Badge, Button, Text, Stack, Paper } from '@mantine/core'
import type { SubmissionServiceTestCaseResultDto } from '@/api/types.gen'
import styles from './TestCaseResults.module.css'

interface TestCaseResultsProps {
  testCases: SubmissionServiceTestCaseResultDto[]
  showHiddenTests?: boolean
}

/**
 * TestCaseResults Component
 * 
 * Displays detailed test case execution results with expand/collapse functionality.
 * Features:
 * - Table view with status badges
 * - Execution metrics (time, memory)
 * - Input/output details on expand
 * - Hidden test cases handling
 * - 100% Vietnamese UI
 */
export function TestCaseResults({ testCases, showHiddenTests = false }: TestCaseResultsProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  // Filter test cases based on showHiddenTests prop
  const visibleTestCases = showHiddenTests 
    ? testCases 
    : testCases.filter((tc) => !tc.hidden)

  const hiddenTestCount = testCases.filter((tc) => tc.hidden).length

  // Format execution time
  const formatExecutionTime = (ms: number | undefined): string => {
    if (ms === undefined) return 'N/A'
    
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)} s`
    }
    return `${ms} ms`
  }

  // Format memory usage
  const formatMemoryUsage = (bytes: number | undefined): string => {
    if (bytes === undefined) return 'N/A'
    
    const kb = bytes / 1024
    if (kb >= 1024) {
      const mb = kb / 1024
      return `${mb.toFixed(2)} MB`
    }
    return `${kb.toFixed(2)} KB`
  }

  // Toggle expand/collapse
  const handleToggleExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  // Empty state
  if (testCases.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          Không có kết quả test nào
        </Text>
      </Paper>
    )
  }

  return (
    <Stack gap="md">
      {/* Hidden test count */}
      {!showHiddenTests && hiddenTestCount > 0 && (
        <Text size="sm" c="dimmed">
          {hiddenTestCount} bài test ẩn (chỉ giáo viên xem được)
        </Text>
      )}

      {/* Test cases table */}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>STT</Table.Th>
            <Table.Th>Mô tả</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Thời gian</Table.Th>
            <Table.Th>Bộ nhớ</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {visibleTestCases.map((testCase, index) => {
            const testCaseKey = `test-case-${testCase.order || index}`
            const isExpanded = expandedRow === index
            const description = testCase.description || `Test case #${testCase.order || index + 1}`

            return (
              <React.Fragment key={testCaseKey}>
                {/* Main row */}
                <Table.Tr>
                  <Table.Td>{testCase.order || index + 1}</Table.Td>
                  <Table.Td>{description}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={testCase.passed ? 'green' : 'red'}
                      variant="filled"
                      size="sm"
                      style={{ backgroundColor: testCase.passed ? 'green' : 'red' }}
                    >
                      {testCase.passed ? 'Đạt' : 'Không đạt'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatExecutionTime(testCase.executionTime)}</Table.Td>
                  <Table.Td>{formatMemoryUsage(testCase.memoryUsed)}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      size="xs"
                      onClick={() => handleToggleExpand(index)}
                    >
                      {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </Button>
                  </Table.Td>
                </Table.Tr>

                {/* Expanded details row */}
                {isExpanded && (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Paper p="md" withBorder className={styles.expandedDetails}>
                        <Stack gap="md">
                          {/* Input */}
                          <div>
                            <Text fw={600} size="sm" mb={4}>
                              Đầu vào:
                            </Text>
                            <Paper p="sm" bg="gray.0" className={styles.codeBlock}>
                              <Text size="sm" ff="monospace">
                                {testCase.input || 'N/A'}
                              </Text>
                            </Paper>
                          </div>

                          {/* Expected output */}
                          <div>
                            <Text fw={600} size="sm" mb={4}>
                              Kết quả mong đợi:
                            </Text>
                            <Paper p="sm" bg="gray.0" className={styles.codeBlock}>
                              <Text size="sm" ff="monospace">
                                {testCase.output || 'N/A'}
                              </Text>
                            </Paper>
                          </div>

                          {/* Actual output */}
                          <div>
                            <Text fw={600} size="sm" mb={4}>
                              Kết quả thực tế:
                            </Text>
                            <Paper 
                              p="sm" 
                              bg={testCase.passed ? 'green.0' : 'red.0'}
                              className={styles.codeBlock}
                            >
                              <Text size="sm" ff="monospace">
                                {testCase.actualOutput || 'N/A'}
                              </Text>
                            </Paper>
                          </div>

                          {/* Error message */}
                          {testCase.errorMessage && (
                            <div>
                              <Text fw={600} size="sm" mb={4} c="red">
                                Thông báo lỗi:
                              </Text>
                              <Paper p="sm" bg="red.0" className={styles.codeBlock}>
                                <Text size="sm" c="red">
                                  {testCase.errorMessage}
                                </Text>
                              </Paper>
                            </div>
                          )}
                        </Stack>
                      </Paper>
                    </Table.Td>
                  </Table.Tr>
                )}
              </React.Fragment>
            )
          })}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}
