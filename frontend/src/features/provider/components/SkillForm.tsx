/**
 * SkillForm Component - Create/Edit Skills
 *
 * Form for creating and editing skills with:
 * - Name (required)
 * - Description (required, Markdown editor)
 * - Vietnamese validation messages
 * - Create/Edit modes
 *
 * @example
 * // Create mode
 * <SkillForm mode="create" onSuccess={() => navigate('/provider/dashboard')} />
 *
 * @example
 * // Edit mode
 * <SkillForm mode="edit" skillId="123" onSuccess={() => navigate('/provider/dashboard')} />
 */

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import styles from './SkillForm.module.css'

import { useEffect } from 'react'
import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import {
  Paper,
  Container,
  Stack,
  Group,
  Button,
  TextInput,
  Title,
  Alert,
  Loader,
  Center,
  Text,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import MDEditor from '@uiw/react-md-editor'
import {
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useSkillDetailQuery,
} from '../api'

// Zod schema for skill form validation
const skillFormSchema = z.object({
  name: z.string().min(1, 'Tên kỹ năng là bắt buộc'),
  // description is handled separately with editorContent state, not in form
})

type SkillFormData = z.infer<typeof skillFormSchema>

interface SkillFormProps {
  mode: 'create' | 'edit'
  skillId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function SkillForm({ mode, skillId, onSuccess, onCancel }: SkillFormProps) {
  const navigate = useNavigate()
  const [editorContent, setEditorContent] = React.useState('')
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Fetch skill data for edit mode
  const { data: skillData, isLoading: isLoadingSkill } = useSkillDetailQuery(
    mode === 'edit' && skillId ? skillId : null
  )

  // Mutations for create and update
  const createMutation = useCreateSkillMutation()
  const updateMutation = useUpdateSkillMutation()

  // Form setup with Mantine form
  const form = useForm<SkillFormData>({
    validate: zod4Resolver(skillFormSchema),
    initialValues: {
      name: '',
    },
  })

  // Load skill data into form when editing
  useEffect(() => {
    console.log('[SkillForm] Effect triggered', {
      mode,
      skillDataExists: !!skillData,
      isInitialized,
      skillDataId: skillData?.id,
    })

    if (mode === 'edit' && skillData && !isInitialized) {
      console.log('[SkillForm] Loading skill data for edit mode', {
        skillId: skillData.id,
        name: skillData.name,
        descriptionLength: skillData.description?.length || 0,
      })
      form.setValues({
        name: skillData.name || '',
      })
      setEditorContent(skillData.description || '')
      setIsInitialized(true)
    } else if (mode === 'create' && !isInitialized) {
      console.log('[SkillForm] Initializing create mode')
      setIsInitialized(true)
    }
  }, [mode, skillData, isInitialized])

  // Sync editor content with form state for validation
  // NOTE: We use a callback ref approach to avoid adding 'form' to dependencies
  // The form.setFieldValue function itself is what we care about, not the form object
  // Adding 'form' to dependencies would cause infinite loops because form object
  // recreates on every render in useForm hook
  React.useEffect(() => {
    const timer = setTimeout(() => {
      form.setFieldValue('description', editorContent)
    }, 0)
    return () => clearTimeout(timer)
  }, [editorContent])

  // Handle form submission
  const onSubmit = async (values: SkillFormData) => {
    console.log('[SkillForm] Form submission started', {
      mode,
      name: values.name,
      editorContentLength: editorContent.length,
      editorContentPreview: editorContent.substring(0, 50),
    })

    // Validate editor content on submit
    if (!editorContent || editorContent.trim().length === 0) {
      console.log('[SkillForm] Editor content validation failed')
      form.setFieldError('description', 'Mô tả là bắt buộc')
      return
    }

    try {
      // Clean up markdown content from MDEditor duplication bug
      // The bug causes list items like "- Item" to become "- - Item" or "- - - Item"
      const cleanedContent = editorContent
        .split('\n')
        .map((line) => {
          // Fix multiple "- - " to "- " for list items (handles "- - - " and "- - ")
          let cleaned = line
          // Keep removing "- - " from the start until only one dash remains
          while (cleaned.match(/^(\s*)- - /)) {
            cleaned = cleaned.replace(/^(\s*)- - /, '$1- ')
          }
          return cleaned
        })
        .join('\n')

      const submitData = {
        name: values.name,
        description: cleanedContent,
      }

      console.log('[SkillForm] Submitting data', {
        mode,
        dataKeys: Object.keys(submitData),
        originalLength: editorContent.length,
        cleanedLength: cleanedContent.length,
      })

      if (mode === 'create') {
        console.log('[SkillForm] Creating skill...')
        await createMutation.mutateAsync(submitData)
      } else {
        if (!skillId) {
          throw new Error('Skill ID is required for update')
        }
        console.log('[SkillForm] Updating skill...', { skillId })
        await updateMutation.mutateAsync({
          id: skillId,
          data: submitData,
        })
      }

      console.log('[SkillForm] Submission successful')
      // Show success message and navigate
      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: '/provider/dashboard' })
      }
    } catch (error) {
      console.error('[SkillForm] Error submitting form:', error)
    }
  }

  const isLoading = isLoadingSkill && mode === 'edit'
  const isMutating = createMutation.isPending || updateMutation.isPending

  // Show loading state while fetching skill data
  if (isLoading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader />
      </Center>
    )
  }

  // Show error if fetch failed
  if (mode === 'edit' && !skillData && skillId) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Lỗi">
          Không thể tải thông tin kỹ năng
        </Alert>
        <Button mt="md" onClick={() => navigate({ to: '/provider/dashboard' })}>
          Quay lại
        </Button>
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Paper p="xl" radius="md" withBorder shadow="sm">
        <Stack gap="lg">
          {/* Title */}
          <Title order={2}>
            {mode === 'create' ? 'Tạo kỹ năng mới' : 'Chỉnh sửa kỹ năng'}
          </Title>

          {/* Error alerts */}
          {createMutation.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {(createMutation.error as any).message || 'Lỗi khi tạo kỹ năng'}
            </Alert>
          )}

          {updateMutation.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {(updateMutation.error as any).message || 'Lỗi khi cập nhật kỹ năng'}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              {/* Name input */}
              <TextInput
                label="Tên kỹ năng"
                placeholder="Nhập tên kỹ năng..."
                {...form.getInputProps('name')}
                required
                disabled={isMutating}
                size="md"
              />

              {/* Description input - Markdown Editor with separate state */}
              <div data-color-mode="light">
                <Text component="label" fw={500} size="sm" mb="xs">
                  Mô tả (Markdown)
                </Text>
                <Text size="xs" c="dimmed" mb="md">
                  Nhập mô tả bằng Markdown. Hỗ trợ in đậm, in nghiêng, code blocks, v.v.
                </Text>
                <MDEditor
                  className={styles.markdownEditor}
                  key={`skill-editor-${mode}-${skillId || 'create'}`}
                  value={editorContent}
                  onChange={(val) => {
                    console.log('[SkillForm] MDEditor onChange input value', { 
                      length: val?.length || 0,
                      value: val?.substring(0, 100)
                    })
                    setEditorContent(val || '')
                  }}
                  preview="live"
                  height={400}
                  visibleDragbar={false}
                  hideToolbar={false}
                  highlightEnable={false}
                  previewOptions={{
                    skipHtml: false,
                    remarkPlugins: [],
                    rehypePlugins: [],
                  }}
                  textareaProps={{
                    disabled: isMutating,
                    placeholder: 'Nhập mô tả bằng Markdown...',
                    style: { minHeight: '350px' },
                  }}
                  style={{
                    borderRadius: '4px',
                    border:
                      form.errors.description && !editorContent
                        ? '2px solid var(--mantine-color-red-6)'
                        : '1px solid var(--mantine-color-gray-3)',
                  }}
                />
                {form.errors.description && !editorContent && (
                  <Text c="red" size="sm" mt="xs">
                    {form.errors.description}
                  </Text>
                )}
              </div>

              {/* Action buttons */}
              <Group justify="flex-end" gap="md" mt="md">
                <Button
                  variant="light"
                  size="md"
                  onClick={() => onCancel?.() || navigate({ to: '/provider/dashboard' })}
                  disabled={isMutating}
                >
                  Hủy
                </Button>
                <Button type="submit" size="md" loading={isMutating}>
                  {mode === 'create' ? 'Tạo kỹ năng' : 'Cập nhật kỹ năng'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
