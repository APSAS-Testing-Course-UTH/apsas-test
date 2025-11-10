import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  Alert,
  Loader,
  Center,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { SubmissionServiceSubmissionResponse, EvaluationServiceRuntimeResponse } from '@/api/types.gen';
import { validateSubmission } from '../schemas';
import { useFormAutoSave, AUTO_SAVE_LABELS } from '../hooks';
import { AdvancedCodeEditor } from './AdvancedCodeEditor';
import styles from './CodeSubmissionForm.module.css';

interface CodeSubmissionFormProps {
  assignmentId: string;
  runtimes: EvaluationServiceRuntimeResponse[];
  isLoading?: boolean;
  onSubmit: (data: {
    assignmentId: string
    code: string
    language: string
  }) => Promise<SubmissionServiceSubmissionResponse>;
  onError?: (error: Error) => void;
  onSuccess?: (response: SubmissionServiceSubmissionResponse) => void;
}

const UI_LABELS = {
  language: 'Ngôn ngữ',
  codeSubmission: 'Mã bài nộp',
  characterCount: (count: number) => `${count} ký tự`,
  maxCharacters: 'Tối đa 10,000 ký tự',
  buttons: {
    submit: 'Nộp bài',
    clear: 'Xóa',
    copy: 'Sao chép',
    clearDraft: 'Xóa bản nháp',
  },
  placeholders: {
    code: 'Viết mã của bạn tại đây...',
    language: 'Chọn ngôn ngữ lập trình',
  },
  errors: {
    selectLanguage: 'Vui lòng chọn ngôn ngữ',
    codeEmpty: 'Mã không được trống',
    codeTooLong: 'Mã quá dài (tối đa 10,000 ký tự)',
    submitFailed: 'Lỗi nộp bài',
  },
  loading: 'Đang nộp...',
  success: 'Bài nộp thành công!',
  copied: 'Đã sao chép vào clipboard',
  draft: {
    indicator: 'Bản nháp được khôi phục',
    saved: 'Bài được lưu',
  },
};

export function CodeSubmissionForm({
  assignmentId,
  runtimes,
  isLoading = false,
  onSubmit,
  onError,
  onSuccess,
}: CodeSubmissionFormProps) {
  const [selectedRuntimeId, setSelectedRuntimeId] = useState<string | null>(
    runtimes.length > 0 ? runtimes[0].language || null : null
  );
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editorTheme, setEditorTheme] = useState('vs-dark');

  const {
    lastSavedTime,
    isDraft,
    isSaving,
    clearDraft: clearAutoSaveDraft,
    recoverDraft,
  } = useFormAutoSave({
    draftKey: `draft:${assignmentId}`,
    code,
    runtimeId: selectedRuntimeId,
    debounceMs: 1000,
    onError: (error) => {
      console.error('Auto-save error:', error);
      onError?.(error);
    },
  });

  useEffect(() => {
    const draft = recoverDraft();
    if (draft && draft.code) {
      setCode(draft.code);
      if (draft.runtimeId) {
        setSelectedRuntimeId(draft.runtimeId);
      }
    }
  }, [assignmentId, recoverDraft]);

  const selectedRuntime = runtimes.find((r) => r.language === selectedRuntimeId);
  const characterCount = code.length;
  const maxCharacters = 10000;
  const isCharCountWarning = characterCount > maxCharacters * 0.8;
  const isCharCountError = characterCount > maxCharacters;
  const isSubmitDisabled = isLoading || isSubmitting;

  const validate = useCallback((): boolean => {
    // Use Zod schema for validation
    const result = validateSubmission({
      assignmentId,
      code,
      language: selectedRuntimeId,
    })

    if (result.success) {
      setErrors({})
      return true
    } else {
      // Map schema validation errors to form field errors
      const newErrors: Record<string, string> = {}
      if (result.errors.assignmentId) {
        newErrors.assignmentId = result.errors.assignmentId
      }
      if (result.errors.code) {
        newErrors.code = result.errors.code
      }
      if (result.errors.language) {
        newErrors.runtime = result.errors.language
      }
      setErrors(newErrors)
      return false
    }
  }, [assignmentId, code, selectedRuntimeId])

  const validateField = useCallback((field: 'runtime' | 'code') => {
    // Per-field validation using schema
    const newErrors = { ...errors }

    if (field === 'runtime') {
      if (!selectedRuntimeId) {
        newErrors.runtime = UI_LABELS.errors.selectLanguage
      } else {
        delete newErrors.runtime
      }
    }

    if (field === 'code') {
      if (!code.trim()) {
        newErrors.code = UI_LABELS.errors.codeEmpty
      } else if (code.length > maxCharacters) {
        newErrors.code = UI_LABELS.errors.codeTooLong
      } else {
        delete newErrors.code
      }
    }

    setErrors(newErrors)
  }, [selectedRuntimeId, code, errors, maxCharacters, UI_LABELS.errors.selectLanguage, UI_LABELS.errors.codeEmpty, UI_LABELS.errors.codeTooLong])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) return;

      if (!selectedRuntime) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const submissionRequest = {
          assignmentId,
          code: code.trim(),
          language: selectedRuntime.language || '',
        };

        const response = await onSubmit(submissionRequest);

        onSuccess?.(response);

        setSubmitSuccess(true);
        setSubmitError(null);

        clearAutoSaveDraft();

        setCode('');
        setErrors({});

        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : UI_LABELS.errors.submitFailed;
        setSubmitError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, selectedRuntime, assignmentId, code, onSubmit, onError, onSuccess, clearAutoSaveDraft]
  );

  const handleClear = useCallback(() => {
    setCode('');
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
    clearAutoSaveDraft();
  }, [clearAutoSaveDraft]);

  const runtimeOptions = runtimes.map((runtime) => ({
    value: runtime.language || '',
    label: `${runtime.language} ${runtime.version}`,
  }));

  const getMonacoLanguage = (language: string | null): string => {
    if (!language) return 'plaintext';
    const lang = language.toLowerCase();
    if (['python', 'java', 'javascript', 'typescript', 'cpp', 'c'].includes(lang)) {
      return lang;
    }
    return 'plaintext';
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Stack gap="lg">
        {isDraft && (
          <Alert icon={<IconCheck />} color="blue" title={UI_LABELS.draft.indicator}>
            Mã của bạn từ phiên làm việc trước đã được khôi phục. Hãy tiếp tục hoặc xóa và bắt đầu lại.
          </Alert>
        )}

        <div className={styles.formGroup}>
          <Select
            label={UI_LABELS.language}
            placeholder={UI_LABELS.placeholders.language}
            value={selectedRuntimeId}
            onChange={setSelectedRuntimeId}
            data={runtimeOptions}
            searchable
            clearable={false}
            disabled={isLoading || isSubmitting}
            error={errors.runtime}
            aria-label={UI_LABELS.placeholders.language}
            aria-invalid={!!errors.runtime}
            aria-describedby={errors.runtime ? 'runtime-error' : undefined}
            onBlur={() => validateField('runtime')}
            classNames={{
              input: styles.selectInput,
            }}
          />
          {errors.runtime && (
            <Text
              id="runtime-error"
              size="sm"
              c="red"
              role="alert"
              className={styles.errorMessage}
            >
              {errors.runtime}
            </Text>
          )}
        </div>

        <div className={styles.formGroup}>
          <AdvancedCodeEditor
            language={getMonacoLanguage(selectedRuntimeId)}
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              if (errors.code) setErrors({ ...errors, code: '' });
            }}
            theme={editorTheme as 'vs-light' | 'vs-dark' | 'hc-black'}
            onThemeChange={setEditorTheme}
            height="700px"
            minHeight="600px"
            isReadOnly={isLoading || isSubmitting}
            isLoading={isLoading || isSubmitting}
            showKeyboardShortcuts={true}
            onValidate={(validationErrors) => {
              if (validationErrors.length > 0) {
                console.warn('Code validation errors:', validationErrors);
              }
            }}
          />
        </div>

        <Group justify="space-between" mt="xs" gap="xs">
          <Group gap="xs">
            <Text
              id="code-counter"
              size="sm"
              c={isCharCountError ? 'red' : isCharCountWarning ? 'orange' : 'dimmed'}
              className={styles.characterCounter}
            >
              {UI_LABELS.characterCount(characterCount)} / {maxCharacters}
            </Text>
            {isSaving && <Loader size={14} />}
          </Group>
          {lastSavedTime && !isSaving && (
            <Text size="sm" c="teal" title="Auto-save active">
              {AUTO_SAVE_LABELS.lastSaved(lastSavedTime)}
            </Text>
          )}
        </Group>

        {characterCount > 0 && (
          <Text size="sm" c="dimmed" mt="xs">
            {UI_LABELS.maxCharacters}
          </Text>
        )}

        {errors.code && (
          <div
            id="code-error"
            role="alert"
            className={styles.errorMessage}
            style={{ marginTop: 'var(--mantine-spacing-xs)' }}
          >
            <Group gap={4} wrap="nowrap">
              <IconAlertCircle size={14} style={{ flexShrink: 0 }} />
              <Text size="sm" c="red">
                {errors.code}
              </Text>
            </Group>
          </div>
        )}

        {submitSuccess && (
          <Alert icon={<IconCheck />} color="green" title={UI_LABELS.success}>
            Mã của bạn đang được kiểm tra. Vui lòng chờ kết quả...
          </Alert>
        )}

        {submitError && (
          <Alert icon={<IconAlertCircle />} color="red" title={UI_LABELS.errors.submitFailed}>
            {submitError}
          </Alert>
        )}

        {isSubmitting && (
          <Center py="md">
            <Group gap="xs">
              <Loader size="sm" />
              <Text>{UI_LABELS.loading}</Text>
            </Group>
          </Center>
        )}

        <Group justify="flex-start" gap="sm" className={styles.buttonsGroup}>
          <Tooltip label={isCharCountError ? 'Mã quá dài' : 'Nộp bài giải'} disabled={!isSubmitDisabled}>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              loading={isSubmitting}
              aria-label={UI_LABELS.buttons.submit}
            >
              {isSubmitting ? UI_LABELS.loading : UI_LABELS.buttons.submit}
            </Button>
          </Tooltip>

          <Button
            variant="light"
            onClick={handleClear}
            disabled={!code || isLoading || isSubmitting}
            aria-label={UI_LABELS.buttons.clear}
          >
            {UI_LABELS.buttons.clear}
          </Button>

          {isDraft && (
            <Button
              variant="subtle"
              color="red"
              onClick={clearAutoSaveDraft}
              disabled={isLoading || isSubmitting}
              aria-label={UI_LABELS.buttons.clearDraft}
            >
              {UI_LABELS.buttons.clearDraft}
            </Button>
          )}

          <CopyButton value={code} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? UI_LABELS.copied : UI_LABELS.buttons.copy} withArrow position="right">
                <Button
                  color={copied ? 'teal' : 'gray'}
                  variant="light"
                  onClick={copy}
                  disabled={!code || isLoading || isSubmitting}
                  leftSection={copied ? <IconCheck size={14} /> : undefined}
                  aria-label={UI_LABELS.buttons.copy}
                >
                  {copied ? UI_LABELS.copied : UI_LABELS.buttons.copy}
                </Button>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </form>
  );
}
