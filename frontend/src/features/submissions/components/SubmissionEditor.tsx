import { useState, useCallback } from 'react'
import {
  Tabs,
  Stack,
  Alert,
  Loader,
  Center,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type {
  SubmissionServiceSubmissionResponse,
  EvaluationServiceRuntimeResponse,
} from '@/api/types.gen';
import { CodeSubmissionForm } from './CodeSubmissionForm';
import { FileUploadInput } from './FileUploadInput';
import styles from './SubmissionEditor.module.css';

interface SubmissionEditorProps {
  assignmentId: string;
  runtimes: EvaluationServiceRuntimeResponse[];
  isLoading?: boolean;
  onSubmit: (data: {
    assignmentId: string;
    code: string;
    language: string;
  }) => Promise<SubmissionServiceSubmissionResponse>;
  onError?: (error: Error) => void;
  onSuccess?: (response: SubmissionServiceSubmissionResponse) => void;
}

const UI_LABELS = {
  tabs: {
    editor: 'Nhập mã code',
    file: 'Tải lên tệp',
  },
  errors: {
    submitFailed: 'Lỗi nộp bài: ',
  },
};

/**
 * SubmissionEditor Component
 * 
 * Allows students to submit code via two methods:
 * 1. Code editor (type/paste code)
 * 2. File upload (upload from computer)
 * 
 * @example
 * ```tsx
 * <SubmissionEditor
 *   assignmentId="123"
 *   runtimes={runtimes}
 *   onSubmit={handleSubmit}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export function SubmissionEditor({
  assignmentId,
  runtimes,
  isLoading = false,
  onSubmit,
  onError,
  onSuccess,
}: SubmissionEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'file'>('editor');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCodeSubmit = useCallback(
    async (data: {
      assignmentId: string;
      code: string;
      language: string;
    }): Promise<SubmissionServiceSubmissionResponse> => {
      try {
        setSubmitError(null);
        setIsSubmitting(true);
        const response = await onSubmit(data);
        onSuccess?.(response);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setSubmitError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError]
  );

  const handleFileSubmit = useCallback(
    async (data: { code: string; language: string }): Promise<SubmissionServiceSubmissionResponse> => {
      try {
        setSubmitError(null);
        setIsSubmitting(true);
        const response = await onSubmit({
          assignmentId,
          code: data.code,
          language: data.language,
        });
        onSuccess?.(response);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Lỗi không xác định';
        setSubmitError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [assignmentId, onSubmit, onSuccess, onError]
  );

  return (
    <Stack gap="md">
      {submitError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Lỗi nộp bài"
        >
          {UI_LABELS.errors.submitFailed}
          {submitError}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as 'editor' | 'file')}
        className={styles.submissionTabs}
      >
        <Tabs.List>
          <Tabs.Tab value="editor">{UI_LABELS.tabs.editor}</Tabs.Tab>
          <Tabs.Tab value="file">{UI_LABELS.tabs.file}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="editor" pt="md">
          {isLoading ? (
            <Center p="xl">
              <Loader />
            </Center>
          ) : (
            <CodeSubmissionForm
              assignmentId={assignmentId}
              runtimes={runtimes}
              isLoading={isSubmitting}
              onSubmit={handleCodeSubmit}
              onError={onError}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="file" pt="md">
          {isLoading ? (
            <Center p="xl">
              <Loader />
            </Center>
          ) : (
            <FileUploadInput
              assignmentId={assignmentId}
              onSubmit={handleFileSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
