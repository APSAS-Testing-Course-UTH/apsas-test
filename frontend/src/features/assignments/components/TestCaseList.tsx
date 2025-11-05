/**
 * Test Case List Component
 * Displays visible test cases (hidden=false) with descriptions and samples
 * Vietnamese labels throughout
 */

import { Card, Group, Stack, Text, Badge, Code } from '@mantine/core'
import type { ContentServiceTestCase } from '@/api/types.gen'

interface TestCaseListProps {
  testCases?: ContentServiceTestCase[]
}

const labels = {
  testCases: 'Bộ kiểm tra',
  testCase: 'Bộ kiểm tra',
  input: 'Dữ liệu đầu vào',
  output: 'Kết quả mong đợi',
  weight: 'Trọng số',
  timeout: 'Thời gian chờ',
  memoryLimit: 'Giới hạn bộ nhớ',
  noTestCases: 'Không có bộ kiểm tra',
}

export function TestCaseList({ testCases }: TestCaseListProps) {
  // Filter only visible test cases (hidden === false)
  const visibleTestCases = testCases?.filter((tc) => !tc.hidden) || []

  if (!visibleTestCases || visibleTestCases.length === 0) {
    return (
      <Stack gap="md">
        <Text fw={600} size="lg">
          {labels.testCases}
        </Text>
        <Card withBorder padding="lg" radius="md" bg="var(--mantine-color-gray-0)">
          <Text c="dimmed" ta="center">
            {labels.noTestCases}
          </Text>
        </Card>
      </Stack>
    )
  }

  return (
    <Stack gap="md" className="test-case-list">
      <Text fw={600} size="lg">
        {labels.testCases}
      </Text>

      <Stack gap="sm">
        {visibleTestCases.map((testCase, index) => (
          <Card key={index} withBorder padding="md" radius="md">
            <Stack gap="sm">
              {/* Test Case Header */}
              <Group justify="space-between" wrap="wrap">
                <div>
                  <Text fw={600}>
                    {labels.testCase} #{testCase.order || index + 1}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {testCase.description}
                  </Text>
                </div>
                {testCase.weight && (
                  <Badge variant="light" color="blue">
                    {labels.weight}: {testCase.weight}
                  </Badge>
                )}
              </Group>

              {/* Input/Output */}
              {testCase.input && (
                <div>
                  <Text fw={500} size="sm" c="dimmed">
                    {labels.input}
                  </Text>
                  <Code block p="xs" style={{ overflow: 'auto' }}>
                    {testCase.input}
                  </Code>
                </div>
              )}

              {testCase.output && (
                <div>
                  <Text fw={500} size="sm" c="dimmed">
                    {labels.output}
                  </Text>
                  <Code block p="xs" style={{ overflow: 'auto' }}>
                    {testCase.output}
                  </Code>
                </div>
              )}

              {/* Metadata */}
              {(testCase.timeout || testCase.memoryLimit) && (
                <Group gap="md" wrap="wrap">
                  {testCase.timeout && (
                    <div>
                      <Text fw={500} size="xs" c="dimmed">
                        {labels.timeout}
                      </Text>
                      <Text size="sm">{testCase.timeout}ms</Text>
                    </div>
                  )}
                  {testCase.memoryLimit && (
                    <div>
                      <Text fw={500} size="xs" c="dimmed">
                        {labels.memoryLimit}
                      </Text>
                      <Text size="sm">{testCase.memoryLimit}MB</Text>
                    </div>
                  )}
                </Group>
              )}
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
