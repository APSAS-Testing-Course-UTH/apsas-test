import { useState, useCallback } from 'react'
import {
  Button,
  Group,
  Stack,
  Select,
  Text,
  Alert,
  Progress,
  Badge,
  Box,
  Paper,
  rem,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconUpload,
  IconX,
  IconCheck,
  IconFileText,
} from '@tabler/icons-react'
import { Dropzone } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { encodeToBase64 } from '@/utils/encoding'
import styles from './FileUploadInput.module.css'

// Supported file types mapping
const SUPPORTED_FILE_TYPES: Record<string, string> = {
  '.java': 'Java',
  '.py': 'Python',
  '.cpp': 'C++',
  '.c': 'C',
  '.js': 'JavaScript',
  '.ts': 'TypeScript',
  '.cs': 'C#',
  '.go': 'Go',
  '.rs': 'Rust',
  '.php': 'PHP',
  '.rb': 'Ruby',
  '.pl': 'Perl',
  '.sh': 'Shell',
  '.sql': 'SQL',
}

const UI_LABELS = {
  fileInput: 'Chọn tệp',
  dragDropText: 'Kéo và thả tệp ở đây',
  dragDropSubtext: 'hoặc nhấp để chọn tệp',
  language: 'Ngôn ngữ lập trình',
  selectLanguage: 'Chọn ngôn ngữ...',
  fileInfo: (name: string, size: string) => `${name} (${size})`,
  supportedFormats: 'Định dạng hỗ trợ:',
  maxSize: 'Kích thước tối đa: 10MB',
  uploadProgress: 'Đang tải lên...',
  uploadSuccess: 'Tệp tải lên thành công!',
  uploadError: 'Lỗi tải lên tệp',
  buttons: {
    submit: 'Nộp bài',
    clear: 'Xóa',
    retry: 'Thử lại',
    selectFiles: 'Chọn tệp',
  },
  errors: {
    selectLanguage: 'Vui lòng chọn ngôn ngữ',
    selectFile: 'Vui lòng chọn tệp',
    invalidFileType: 'Loại tệp không được hỗ trợ',
    fileTooLarge: 'Tệp quá lớn (tối đa 10MB)',
  },
  success: {
    fileSelected: 'Tệp đã chọn',
  },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

interface FileUploadInputProps {
  assignmentId: string
  onSubmit: (data: { code: string; language: string }) => Promise<any>
  isSubmitting?: boolean
}

/**
 * FileUploadInput Component with Mantine Dropzone
 *
 * Allows students to upload code files with:
 * - Drag & drop support (Mantine Dropzone)
 * - File type validation
 * - Size validation (max 10MB)
 * - Language auto-detection from extension
 * - File preview with info
 * - Progress bar during upload
 * - Retry button on error
 * - Vietnamese labels and messages
 *
 * @example
 * ```tsx
 * <FileUploadInput
 *   assignmentId="123"
 *   onSubmit={handleFileUpload}
 * />
 * ```
 */
export function FileUploadInput({
  onSubmit,
  isSubmitting = false,
}: FileUploadInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Read file content as text using FileReader API
  const readFileAsText = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
          const content = event.target?.result as string
          resolve(content)
        }

        reader.onerror = () => {
          reject(
            new Error(
              'Không thể đọc tệp. Vui lòng thử lại.'
            )
          )
        }

        reader.readAsText(file)
      })
    },
    []
  )

  // Auto-detect language from file extension
  const detectLanguage = useCallback((file: File): string | null => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    return SUPPORTED_FILE_TYPES[ext] || null
  }, [])

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!SUPPORTED_FILE_TYPES[ext]) {
      return UI_LABELS.errors.invalidFileType
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return UI_LABELS.errors.fileTooLarge
    }

    return null
  }, [])

  // Handle file selection
  const handleFileChange = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        setSelectedFile(null)
        setLanguage(null)
        setError(null)
        return
      }

      const file = files[0]

      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setSelectedFile(null)
        setLanguage(null)
        return
      }

      // File is valid
      setError(null)
      setSelectedFile(file)

      // Auto-detect language
      const detectedLang = detectLanguage(file)
      setLanguage(detectedLang)
    },
    [validateFile, detectLanguage]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async () => {
      if (!selectedFile) {
        setError(UI_LABELS.errors.selectFile)
        return
      }

      if (!language) {
        setError(UI_LABELS.errors.selectLanguage)
        return
      }

      try {
        setError(null)
        setUploadError(null)
        setIsUploading(true)
        setUploadProgress(0)

        // Read file content as text
        let fileContent: string
        try {
          fileContent = await readFileAsText(selectedFile)
        } catch (readError) {
          const errorMsg =
            readError instanceof Error
              ? readError.message
              : 'Không thể đọc tệp'
          setUploadError(errorMsg)
          setIsUploading(false)
          return
        }

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 30
            return newProgress > 90 ? 90 : newProgress
          })
        }, 200)

        // Submit with Base64 encoded code string (as required by BE)
        await onSubmit({ 
          code: encodeToBase64(fileContent), 
          language 
        })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Show success notification
      notifications.show({
        title: 'Thành công',
        message: UI_LABELS.uploadSuccess,
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 3000,
      })

      // Reset form
      setTimeout(() => {
        setSelectedFile(null)
        setLanguage(null)
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Lỗi không xác định'
      setUploadError(errorMsg)
      setError(null)
      setIsUploading(false)
      setUploadProgress(0)

      // Show error notification
      notifications.show({
        title: UI_LABELS.uploadError,
        message: errorMsg,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
        autoClose: 5000,
      })
    }
  }, [selectedFile, language, onSubmit, readFileAsText])

  // Handle retry
  const handleRetry = useCallback(() => {
    setUploadError(null)
    setUploadProgress(0)
  }, [])

  // Handle clear
  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setLanguage(null)
    setError(null)
    setUploadProgress(0)
    setUploadError(null)
  }, [])

  const languageOptions = Object.values(SUPPORTED_FILE_TYPES)
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .sort()
    .map((lang) => ({ value: lang, label: lang }))

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Stack gap="md" className={styles.fileUploadInput}>
      {/* Error Alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Lỗi"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Upload Error with Retry */}
      {uploadError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title={UI_LABELS.uploadError}
          withCloseButton
          onClose={() => setUploadError(null)}
        >
          <Group justify="space-between">
            <Text size="sm">{uploadError}</Text>
            <Button
              size="xs"
              variant="filled"
              color="red"
              onClick={handleRetry}
            >
              {UI_LABELS.buttons.retry}
            </Button>
          </Group>
        </Alert>
      )}

      {/* Mantine Dropzone */}
      {!selectedFile ? (
        <Dropzone
          onDrop={handleFileChange}
          onReject={(files) => {
            if (files.length > 0) {
              const file = files[0]
              const ext = file.file.name
                .substring(file.file.name.lastIndexOf('.'))
                .toLowerCase()
              if (!SUPPORTED_FILE_TYPES[ext]) {
                setError(UI_LABELS.errors.invalidFileType)
              } else if (file.file.size > MAX_FILE_SIZE) {
                setError(UI_LABELS.errors.fileTooLarge)
              }
            }
          }}
          maxSize={MAX_FILE_SIZE}
          accept={{
            'text/plain': ['.txt'],
            'text/x-java-source': ['.java'],
            'text/x-python': ['.py'],
            'text/x-c++src': ['.cpp'],
            'text/x-c': ['.c'],
            'application/javascript': ['.js'],
            'application/typescript': ['.ts'],
            'text/x-csharp': ['.cs'],
            'text/x-go': ['.go'],
            'text/x-rust': ['.rs'],
            'text/x-php': ['.php'],
            'text/x-ruby': ['.rb'],
            'text/x-perl': ['.pl'],
            'application/x-sh': ['.sh'],
            'application/sql': ['.sql'],
          }}
          multiple={false}
        >
          <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
            <Box>
              <Dropzone.Accept>
                <IconUpload
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFileText
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                  stroke={1.5}
                />
              </Dropzone.Idle>

              <Text size="xl" inline mt="xl">
                {UI_LABELS.dragDropText}
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                {UI_LABELS.dragDropSubtext}
              </Text>
              <Text size="xs" c="dimmed" mt="md">
                {UI_LABELS.maxSize}
              </Text>
            </Box>
          </Group>
        </Dropzone>
      ) : (
        // File Preview
        <Paper withBorder p="md" radius="md" className={styles.filePreview}>
          <Group justify="space-between" align="flex-start">
            <Group gap="sm" flex={1}>
              <IconFileText size={32} />
              <Box flex={1}>
                <Text fw={500}>{selectedFile.name}</Text>
                <Text size="sm" c="dimmed">
                  {formatFileSize(selectedFile.size)}
                </Text>
              </Box>
            </Group>
            <Badge color="green" leftSection={<IconCheck size={12} />}>
              {UI_LABELS.success.fileSelected}
            </Badge>
          </Group>
        </Paper>
      )}

      {/* Supported Formats */}
      <Text size="sm" c="dimmed">
        <strong>{UI_LABELS.supportedFormats}</strong>
        {Object.keys(SUPPORTED_FILE_TYPES)
          .slice(0, 7)
          .map((ext) => ext.slice(1).toUpperCase())
          .join(', ')}{' '}
        ...
      </Text>

      {/* Language Selection - Auto-detected from file extension */}
      {selectedFile && (
        <Select
          label={UI_LABELS.language}
          placeholder={UI_LABELS.selectLanguage}
          value={language}
          onChange={setLanguage}
          data={languageOptions}
          required
          searchable
          disabled // ✅ DISABLE: Prevent user from changing auto-detected language
          description="Ngôn ngữ được tự động phát hiện từ phần mở rộng tệp"
        />
      )}

      {/* Progress Bar */}
      {isUploading && (
        <Box>
          <Text size="sm" mb="xs">
            {UI_LABELS.uploadProgress} {Math.round(uploadProgress)}%
          </Text>
          <Progress
            value={uploadProgress}
            animated
            striped
            color={uploadProgress === 100 ? 'green' : 'blue'}
          />
        </Box>
      )}

      {/* Action Buttons */}
      <Group justify="space-between">
        {selectedFile && !isUploading && (
          <Button
            variant="default"
            onClick={handleClear}
            leftSection={<IconX size={14} />}
          >
            {UI_LABELS.buttons.clear}
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isUploading || isSubmitting}
          loading={isUploading || isSubmitting}
          ml="auto"
        >
          {UI_LABELS.buttons.submit}
        </Button>
      </Group>
    </Stack>
  )
}
