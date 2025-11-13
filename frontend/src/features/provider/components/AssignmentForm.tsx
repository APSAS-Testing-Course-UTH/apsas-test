import { useEffect, useMemo } from 'react'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import {
  Paper,
  Container,
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Title,
  Tabs,
  Alert,
  Badge,
  Divider,
  Text,
  ActionIcon,
  Checkbox,
  Box,
} from '@mantine/core'
import { IconAlertCircle, IconPlus, IconTrash, IconAlertTriangle } from '@tabler/icons-react'

import type { CreateAssignmentFormData, UpdateAssignmentFormData, TestCase } from '../schemas/assignmentFormSchema'
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  toCreateAssignmentRequest,
  toUpdateAssignmentRequest,
} from '../schemas/assignmentFormSchema'
import { useCreateAssignmentMutation } from '../api/useCreateAssignmentMutation'
import { useUpdateAssignmentMutation } from '../api/useUpdateAssignmentMutation'
import { useAssignmentDetailQuery } from '../api/useAssignmentDetailQuery'
import { useSkillsQuery } from '../api/useSkillsQuery'
import { useTutorialsQuery } from '../api/useTutorialsQuery'
import styles from './AssignmentForm.module.css'

interface AssignmentFormProps {
  mode: 'create' | 'edit'
  assignmentId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function AssignmentForm({ mode, assignmentId, onSuccess, onCancel }: AssignmentFormProps) {
  const { data: assignmentData, isLoading: isLoadingAssignment, error: assignmentError } = useAssignmentDetailQuery(
    assignmentId || ''
  )

  // Fetch skills and tutorials for multiselect options (page size 100 to get all available)
  const { data: skillsData, isLoading: isLoadingSkills } = useSkillsQuery({ page: 0, size: 100 })
  const { data: tutorialsData, isLoading: isLoadingTutorials } = useTutorialsQuery({ page: 0, size: 100 })

  const createMutation = useCreateAssignmentMutation()
  const updateMutation = useUpdateAssignmentMutation()

  const schema = mode === 'create' ? createAssignmentSchema : updateAssignmentSchema

  const form = useForm({
    validate: zod4Resolver(schema),
    initialValues: {
      title: '',
      description: '',
      difficultyLevel: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
      languages: [] as string[],
      testCases: [
        {
          order: 1,
          description: '',
          hidden: false,
          weight: 1,
          input: '',
          output: '',
          timeout: 5000,
          memoryLimit: 256,
        },
      ],
      maxScore: 100,
      skillIds: [] as string[],
      tutorialIds: [] as string[],
      startDate: '' as any,
      dueDate: '' as any,
    },
  })

  useEffect(() => {
    if (mode === 'edit' && assignmentData) {
      // Helper to convert Date to YYYY-MM-DD string for HTML date input
      const dateToInputString = (date: string | Date | null | undefined): string => {
        if (!date) return ''
        const d = typeof date === 'string' ? new Date(date) : date
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const loadedData = {
        title: assignmentData.title || '',
        description: assignmentData.description || '',
        difficultyLevel: (assignmentData.difficultyLevel as 'EASY' | 'MEDIUM' | 'HARD') || ('EASY' as const),
        languages: Array.isArray(assignmentData.languages) ? assignmentData.languages : [],
        testCases: (assignmentData.testCases || []).map((tc) => ({
          order: tc.order || 1,
          description: tc.description || '',
          hidden: tc.hidden || false,
          weight: tc.weight || 1,
          input: tc.input || '',
          output: tc.output || '',
          timeout: tc.timeout || 5000,
          memoryLimit: tc.memoryLimit || 256,
        })),
        maxScore: assignmentData.maxScore || 100,
        skillIds: Array.isArray(assignmentData.skills) 
          ? assignmentData.skills.map((s) => s.id || '').filter(Boolean)
          : [],
        tutorialIds: Array.isArray(assignmentData.tutorials)
          ? assignmentData.tutorials.map((t) => t.id || '').filter(Boolean)
          : [],
        startDate: dateToInputString(assignmentData.startDate),
        dueDate: dateToInputString(assignmentData.dueDate),
      }
      form.setValues(loadedData)
    }
  }, [assignmentId, assignmentData])

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (mode === 'create') {
        const payload = toCreateAssignmentRequest(values as CreateAssignmentFormData)
        await createMutation.mutateAsync(payload)
      } else {
        const payload = toUpdateAssignmentRequest(values as UpdateAssignmentFormData)
        if (!assignmentId) throw new Error('Yêu cầu ID bài tập để cập nhật')
        await updateMutation.mutateAsync({ id: assignmentId, data: payload })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Lỗi nộp form:', error)
    }
  }

  const handleAddTestCase = () => {
    const newTestCase: TestCase = {
      order: (form.values.testCases?.length || 0) + 1,
      description: '',
      hidden: false,
      weight: 1,
      input: '',
      output: '',
      timeout: 5000,
      memoryLimit: 256,
    }
    form.insertListItem('testCases', newTestCase)
  }

  const handleRemoveTestCase = (index: number) => {
    form.removeListItem('testCases', index)
  }

  const difficultyOptions = useMemo(
    () => [
      { value: 'EASY', label: 'Dễ' },
      { value: 'MEDIUM', label: 'Trung bình' },
      { value: 'HARD', label: 'Khó' },
    ],
    []
  )

  const languageOptions = useMemo(
    () => [
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'cpp', label: 'C++' },
      { value: 'javascript', label: 'JavaScript' },
      { value: 'csharp', label: 'C#' },
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
    ],
    []
  )

  // Transform API data to MultiSelect options
  const skillOptions = useMemo(() => {
    if (!skillsData?.content || !Array.isArray(skillsData.content)) {
      return []
    }
    return skillsData.content
      .filter((skill) => skill?.id && skill?.name)
      .map((skill) => ({
        value: skill.id || '',
        label: skill.name || '',
      }))
  }, [skillsData])

  const tutorialOptions = useMemo(() => {
    if (!tutorialsData?.content || !Array.isArray(tutorialsData.content)) {
      return []
    }
    return tutorialsData.content
      .filter((tutorial) => tutorial?.id && tutorial?.title)
      .map((tutorial) => ({
        value: tutorial.id || '',
        label: tutorial.title || '',
      }))
  }, [tutorialsData])

  if (mode === 'edit' && isLoadingAssignment) {
    return (
      <Container size="lg" py="xl">
        <Text>Đang tải thông tin bài tập...</Text>
      </Container>
    )
  }

  if (mode === 'edit' && assignmentError) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle />} title="Lỗi" color="red">
          Không thể tải thông tin bài tập. Vui lòng thử lại.
        </Alert>
        <Button mt="md" onClick={onCancel}>
          Quay lại
        </Button>
      </Container>
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Container size="lg" py="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={1} mb="lg">
          {mode === 'create' ? 'Tạo bài tập mới' : 'Chỉnh sửa bài tập'}
        </Title>

        {(createMutation.error || updateMutation.error) && (
          <Alert icon={<IconAlertTriangle />} title="Lỗi" color="red" mb="md">
            {createMutation.error?.message || updateMutation.error?.message || 'Có lỗi xảy ra'}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Thông tin cơ bản</Tabs.Tab>
              <Tabs.Tab value="languages">Ngôn ngữ</Tabs.Tab>
              <Tabs.Tab value="testcases">Test Cases</Tabs.Tab>
              <Tabs.Tab value="schedule">Lịch</Tabs.Tab>
              <Tabs.Tab value="advanced">Nâng cao</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic" pt="md">
              <Box>
                <Stack gap="md">
                  <TextInput
                    label="Tiêu đề bài tập"
                    placeholder="Ví dụ: Tính tổng mảng"
                    size="md"
                    {...form.getInputProps('title')}
                  />

                  <Textarea
                    label="Mô tả bài tập"
                    placeholder="Mô tả chi tiết yêu cầu, cách giải quyết..."
                    size="md"
                    minRows={6}
                    {...form.getInputProps('description')}
                  />

                  <Select
                    label="Độ khó"
                    placeholder="Chọn độ khó"
                    data={difficultyOptions}
                    size="md"
                    {...form.getInputProps('difficultyLevel')}
                  />

                  <NumberInput
                    label="Điểm tối đa"
                    placeholder="100"
                    min={1}
                    max={1000}
                    size="md"
                    {...form.getInputProps('maxScore')}
                  />
                </Stack>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="languages" pt="md">
              <Box>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Chọn ngôn ngữ lập trình mà sinh viên có thể nộp bằng
                  </Text>
                  <MultiSelect
                    label="Ngôn ngữ hỗ trợ"
                    placeholder="Chọn ít nhất 1 ngôn ngữ"
                    data={languageOptions}
                    searchable
                    size="md"
                    {...form.getInputProps('languages')}
                  />

                  <div>
                    <Text fw={500} mb="xs">
                      Ngôn ngữ đã chọn:
                    </Text>
                    {form.values.languages && form.values.languages.length > 0 ? (
                      <Group>
                        {form.values.languages.map((lang) => (
                          <Badge key={lang} size="lg">
                            {lang}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Chưa chọn ngôn ngữ
                      </Text>
                    )}
                  </div>
                </Stack>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="testcases" pt="md">
              <Box>
                <Stack gap="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Test Cases ({form.values.testCases?.length || 0})</Text>
                      <Text size="sm" c="dimmed">
                        Tối đa 50 test cases
                      </Text>
                    </div>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddTestCase}
                      disabled={form.values.testCases?.length >= 50 || isSubmitting}
                    >
                      Thêm Test Case
                    </Button>
                  </Group>

                  {form.errors['testCases'] && (
                    <Alert icon={<IconAlertTriangle />} title="Lỗi" color="red">
                      {form.errors['testCases']}
                    </Alert>
                  )}

                  {form.values.testCases && form.values.testCases.length > 0 ? (
                    <div className={styles.testCasesTable}>
                      {form.values.testCases.map((_, index) => (
                        <Paper key={index} withBorder p="md" mb="md" className={styles.testCaseCard}>
                          <Group justify="space-between" mb="md">
                            <Title order={4}>Test Case #{index + 1}</Title>
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => handleRemoveTestCase(index)}
                              disabled={form.values.testCases!.length === 1 || isSubmitting}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>

                          <Stack gap="sm">
                            <Textarea
                              label="Mô tả"
                              placeholder="Mô tả test case này"
                              size="sm"
                              minRows={2}
                              {...form.getInputProps(`testCases.${index}.description`)}
                            />

                            <Group grow>
                              <Textarea
                                label="Input"
                                placeholder="Dữ liệu đầu vào"
                                size="sm"
                                minRows={3}
                                {...form.getInputProps(`testCases.${index}.input`)}
                              />
                              <Textarea
                                label="Output"
                                placeholder="Kết quả mong đợi"
                                size="sm"
                                minRows={3}
                                {...form.getInputProps(`testCases.${index}.output`)}
                              />
                            </Group>

                            <Group grow>
                              <NumberInput
                                label="Trọng số (%)"
                                min={0}
                                max={100}
                                size="sm"
                                {...form.getInputProps(`testCases.${index}.weight`)}
                              />
                              <NumberInput
                                label="Timeout (ms)"
                                min={1000}
                                max={60000}
                                step={1000}
                                size="sm"
                                {...form.getInputProps(`testCases.${index}.timeout`)}
                              />
                              <NumberInput
                                label="Memory Limit (MB)"
                                min={32}
                                max={2048}
                                step={64}
                                size="sm"
                                {...form.getInputProps(`testCases.${index}.memoryLimit`)}
                              />
                            </Group>

                            <Checkbox
                              label="Ẩn test case (không hiển thị cho sinh viên)"
                              size="sm"
                              {...form.getInputProps(`testCases.${index}.hidden`, { type: 'checkbox' })}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </div>
                  ) : (
                    <Alert title="Không có test case" color="yellow">
                      Vui lòng thêm ít nhất 1 test case
                    </Alert>
                  )}
                </Stack>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="schedule" pt="md">
              <Box>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Xác định thời gian bài tập có sẵn cho sinh viên (tuỳ chọn)
                  </Text>

                  <Group grow>
                    <TextInput
                      label="Ngày bắt đầu"
                      placeholder="YYYY-MM-DD"
                      size="md"
                      type="date"
                      {...form.getInputProps('startDate')}
                    />
                    <TextInput
                      label="Ngày kết thúc"
                      placeholder="YYYY-MM-DD"
                      size="md"
                      type="date"
                      {...form.getInputProps('dueDate')}
                    />
                  </Group>

                  {form.errors['dueDate'] && (
                    <Alert icon={<IconAlertTriangle />} title="Lỗi ngày tháng" color="red">
                      {form.errors['dueDate']}
                    </Alert>
                  )}
                </Stack>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="advanced" pt="md">
              <Box>
                <Stack gap="md">
                  <div>
                    <Text fw={500} mb="md">
                      Kỹ năng liên quan
                    </Text>
                    <MultiSelect
                      label="Gán kỹ năng"
                      placeholder={isLoadingSkills ? "Đang tải kỹ năng..." : "Chọn kỹ năng (tuỳ chọn)"}
                      data={skillOptions}
                      searchable
                      clearable
                      size="md"
                      disabled={isLoadingSkills}
                      {...form.getInputProps('skillIds')}
                    />
                    <Text size="xs" c="dimmed" mt="xs">
                      Ghi chú: Gán kỹ năng để giúp sinh viên rèn luyện các kỹ năng cụ thể
                    </Text>
                  </div>

                  <Divider />

                  <div>
                    <Text fw={500} mb="md">
                      Hướng dẫn liên quan
                    </Text>
                    <MultiSelect
                      label="Gán hướng dẫn"
                      placeholder={isLoadingTutorials ? "Đang tải hướng dẫn..." : "Chọn hướng dẫn (tuỳ chọn)"}
                      data={tutorialOptions}
                      searchable
                      clearable
                      size="md"
                      disabled={isLoadingTutorials}
                      {...form.getInputProps('tutorialIds')}
                    />
                    <Text size="xs" c="dimmed" mt="xs">
                      Ghi chú: Gán hướng dẫn để cung cấp tài liệu học tập cho sinh viên
                    </Text>
                  </div>
                </Stack>
              </Box>
            </Tabs.Panel>
          </Tabs>

          <Divider my="lg" />
          <Group justify="flex-end">
            <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              {mode === 'create' ? 'Tạo bài tập' : 'Lưu thay đổi'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  )
}
