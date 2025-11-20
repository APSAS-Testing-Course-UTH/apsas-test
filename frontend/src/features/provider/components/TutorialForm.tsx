/**
 * TutorialForm Component - Create/Edit Tutorials
 *
 * Form for creating and editing tutorials with:
 * - Title (required)
 * - Content (markdown, required)
 * - Vietnamese validation messages
 * - Create/Edit modes
 *
 * @example
 * // Create mode
 * <TutorialForm mode="create" onSuccess={() => navigate('/provider/dashboard')} />
 *
 * @example
 * // Edit mode
 * <TutorialForm mode="edit" tutorialId="123" onSuccess={() => navigate('/provider/dashboard')} />
 */

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import styles from './TutorialForm.module.css'

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
  useCreateTutorialMutation,
  useUpdateTutorialMutation,
  useTutorialDetailQuery,
} from '../api'

// Zod schema for tutorial form validation
const tutorialFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  // content is handled separately with editorContent state, not in form
})

type TutorialFormData = z.infer<typeof tutorialFormSchema>

interface TutorialFormProps {
  mode: 'create' | 'edit'
  tutorialId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TutorialForm({ mode, tutorialId, onSuccess, onCancel }: TutorialFormProps) {
  const navigate = useNavigate()
  const [editorContent, setEditorContent] = React.useState('')
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Fetch tutorial data for edit mode
  const { data: tutorialData, isLoading: isLoadingTutorial } = useTutorialDetailQuery(
    mode === 'edit' && tutorialId ? tutorialId : null
  )

  // Mutations for create and update
  const createMutation = useCreateTutorialMutation()
  const updateMutation = useUpdateTutorialMutation()

  // Form setup with Mantine form
  const form = useForm<TutorialFormData>({
    validate: zod4Resolver(tutorialFormSchema),
    initialValues: {
      title: '',
    },
  })

  // Load tutorial data into form when editing
  useEffect(() => {
    console.log('[TutorialForm] Effect triggered', {
      mode,
      tutorialDataExists: !!tutorialData,
      isInitialized,
      tutorialDataId: tutorialData?.id,
    })

    if (mode === 'edit' && tutorialData && !isInitialized) {
      console.log('[TutorialForm] Loading tutorial data for edit mode', {
        tutorialId: tutorialData.id,
        title: tutorialData.title,
        contentLength: tutorialData.content?.length || 0,
      })
      form.setValues({
        title: tutorialData.title || '',
      })
      setEditorContent(tutorialData.content || '')
      setIsInitialized(true)
    } else if (mode === 'create' && !isInitialized) {
      console.log('[TutorialForm] Initializing create mode')
      setIsInitialized(true)
    }
  }, [mode, tutorialData, form, isInitialized])

  // Handle form submission
  const onSubmit = async (values: TutorialFormData) => {
    console.log('[TutorialForm] Form submission started', {
      mode,
      title: values.title,
      editorContentLength: editorContent.length,
      editorContentPreview: editorContent.substring(0, 50),
    })

    // Validate editor content on submit
    if (!editorContent || editorContent.trim().length === 0) {
      console.log('[TutorialForm] Editor content validation failed')
      form.setFieldError('content', 'Nội dung là bắt buộc')
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
        title: values.title,
        content: cleanedContent,
      }

      console.log('[TutorialForm] Submitting data', {
        mode,
        dataKeys: Object.keys(submitData),
        originalLength: editorContent.length,
        cleanedLength: cleanedContent.length,
      })

      if (mode === 'create') {
        console.log('[TutorialForm] Creating tutorial...')
        await createMutation.mutateAsync(submitData)
      } else {
        if (!tutorialId) {
          throw new Error('Tutorial ID is required for update')
        }
        console.log('[TutorialForm] Updating tutorial...', { tutorialId })
        await updateMutation.mutateAsync({
          id: tutorialId,
          data: submitData,
        })
      }

      console.log('[TutorialForm] Submission successful')
      // Show success message and navigate
      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: '/provider/dashboard' })
      }
    } catch (error) {
      console.error('[TutorialForm] Error submitting form:', error)
    }
  }

  const isLoading = isLoadingTutorial && mode === 'edit'
  const isMutating = createMutation.isPending || updateMutation.isPending

  // Logging component renders
  React.useEffect(() => {
    console.log('[TutorialForm] Component rendered', {
      mode,
      isLoading,
      isMutating,
      isInitialized,
      editorContentLength: editorContent.length,
    })
  })

  // Show loading state while fetching tutorial data
  if (isLoading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader />
      </Center>
    )
  }

  // Show error if fetch failed
  if (mode === 'edit' && !tutorialData && tutorialId) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Lỗi">
          Không thể tải thông tin hướng dẫn
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
            {mode === 'create' ? 'Tạo hướng dẫn mới' : 'Chỉnh sửa hướng dẫn'}
          </Title>

          {/* Error alerts */}
          {createMutation.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {(createMutation.error as any).message || 'Lỗi khi tạo hướng dẫn'}
            </Alert>
          )}

          {updateMutation.error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {(updateMutation.error as any).message || 'Lỗi khi cập nhật hướng dẫn'}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              {/* Title input */}
              <TextInput
                label="Tiêu đề"
                placeholder="Nhập tiêu đề hướng dẫn..."
                {...form.getInputProps('title')}
                required
                disabled={isMutating}
                size="md"
              />

              {/* Content input - Markdown Editor with separate state */}
              <div data-color-mode="light">
                <Text component="label" fw={500} size="sm" mb="xs">
                  Nội dung (Markdown)
                </Text>
                <Text size="xs" c="dimmed" mb="md">
                  Nhập nội dung bằng Markdown. Hỗ trợ in đậm, in nghiêng, code blocks, v.v.
                </Text>
                <MDEditor
                  className={styles.markdownEditor}
                  key={`tutorial-editor-${mode}-${tutorialId || 'create'}`}
                  value={editorContent}
                  onChange={(val) => {
                    console.log('[TutorialForm] MDEditor onChange', { newLen: val?.length || 0 })
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
                      form.errors.content && !editorContent
                        ? '2px solid var(--mantine-color-red-6)'
                        : '1px solid var(--mantine-color-gray-3)',
                  }}
                />
                {form.errors.content && !editorContent && (
                  <Text c="red" size="sm" mt="xs">
                    {form.errors.content}
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
                  {mode === 'create' ? 'Tạo hướng dẫn' : 'Cập nhật hướng dẫn'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
