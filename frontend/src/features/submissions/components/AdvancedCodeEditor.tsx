import { useCallback, useRef, useEffect, useState } from 'react';
import {
  Button,
  Group,
  Stack,
  Text,
  SegmentedControl,
  Tooltip,
  Kbd,
  Badge,
  Box,
} from '@mantine/core';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
  IconSearch,
  IconCode,
  IconBraces,
  IconListCheck,
  IconKeyboard,
  IconZoomIn,
  IconZoomOut,
  // IconChevronDown,
  // IconChevronUp,
} from '@tabler/icons-react';
import styles from './AdvancedCodeEditor.module.css';

interface CodeValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface AdvancedCodeEditorProps {
  language: string;
  value: string;
  onChange?: (value: string) => void;
  onValidate?: (errors: CodeValidationError[]) => void;
  theme?: 'vs-light' | 'vs-dark' | 'hc-black';
  height?: string;
  isReadOnly?: boolean;
  isLoading?: boolean;
  showKeyboardShortcuts?: boolean;
  onThemeChange?: (theme: string) => void;
  onZoomChange?: (zoom: number) => void;
  minHeight?: string;
}

const KEYBOARD_SHORTCUTS = [
  {
    category: 'Chỉnh sửa',
    shortcuts: [
      { key: 'Ctrl+Z / Cmd+Z', action: 'Hoàn tác' },
      { key: 'Ctrl+Shift+Z / Cmd+Shift+Z', action: 'Làm lại' },
      { key: 'Ctrl+X / Cmd+X', action: 'Cắt' },
      { key: 'Ctrl+C / Cmd+C', action: 'Sao chép' },
      { key: 'Ctrl+V / Cmd+V', action: 'Dán' },
    ],
  },
  {
    category: 'Tìm kiếm',
    shortcuts: [
      { key: 'Ctrl+F / Cmd+F', action: 'Mở tìm kiếm' },
      { key: 'Ctrl+H / Cmd+H', action: 'Mở tìm & thay thế' },
      { key: 'F3 / Cmd+G', action: 'Tìm kết quả tiếp theo' },
      { key: 'Shift+F3 / Cmd+Shift+G', action: 'Tìm kết quả trước' },
    ],
  },
  {
    category: 'Định dạng',
    shortcuts: [
      { key: 'Shift+Alt+F / Shift+Option+F', action: 'Định dạng toàn bộ' },
      { key: 'Ctrl+K Ctrl+F / Cmd+K Cmd+F', action: 'Định dạng vùng chọn' },
      { key: 'Ctrl+] / Cmd+]', action: 'Tăng thụt đầu dòng' },
      { key: 'Ctrl+[ / Cmd+[', action: 'Giảm thụt đầu dòng' },
    ],
  },
  {
    category: 'Điều hướng',
    shortcuts: [
      { key: 'Ctrl+G / Cmd+G', action: 'Đi tới dòng' },
      { key: 'Ctrl+Shift+O / Cmd+Shift+O', action: 'Đi tới ký hiệu' },
      { key: 'Ctrl+T / Cmd+T', action: 'Tìm ký hiệu toàn cộu' },
    ],
  },
  {
    category: 'Lệnh',
    shortcuts: [
      { key: 'Ctrl+Shift+P / Cmd+Shift+P', action: 'Mở Command Palette' },
      { key: 'Ctrl+Shift+M / Cmd+Shift+M', action: 'Thay đổi ngôn ngữ' },
    ],
  },
];

export function AdvancedCodeEditor({
  language,
  value,
  onChange,
  onValidate,
  theme = 'vs-dark',
  height = '700px',
  isReadOnly = false,
  isLoading = false,
  showKeyboardShortcuts = true,
  onThemeChange,
  onZoomChange,
  minHeight = '500px',
}: AdvancedCodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState<string>(theme);
  const [zoom, setZoom] = useState(100);
  const [validationErrors, setValidationErrors] = useState<CodeValidationError[]>([]);
  const [isShortcutsOpen, _setIsShortcutsOpen] = useState(false);
  const [lineCount, setLineCount] = useState(value.split('\n').length);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isReadOnly });
      
      // CRITICAL FIX: Force update IME textarea readonly state
      // Monaco Editor doesn't properly update the IME textarea when readonly changes
      // This is a known issue: https://github.com/microsoft/monaco-editor/issues/2947
      setTimeout(() => {
        const imeTextarea = document.querySelector('.ime-text-area') as HTMLTextAreaElement;
        if (imeTextarea) {
          imeTextarea.readOnly = isReadOnly;
        }
      }, 50);
    }
  }, [isReadOnly]);

  const handleEditorMount = useCallback((editorInstance: editor.IStandaloneCodeEditor, monacoInstance: any) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;

    editorInstance.updateOptions({
      fontFamily: '"Fira Code", "Monaco", "Courier New", monospace',
      fontLigatures: true,
      readOnly: isReadOnly, // Ensure readonly is set correctly on mount
    });

    // CRITICAL FIX: Force update IME textarea readonly state on mount
    // Monaco Editor has a bug where the IME textarea doesn't sync with editor options
    // Reference: https://github.com/microsoft/monaco-editor/issues/2947
    setTimeout(() => {
      const imeTextarea = document.querySelector('.ime-text-area') as HTMLTextAreaElement;
      if (imeTextarea) {
        imeTextarea.readOnly = isReadOnly;
      }
    }, 100);

    editorInstance.onDidChangeCursorSelection(() => {
      const selection = editorInstance.getSelection();
      if (selection && !selection.isEmpty()) {
        const currentValue = editorInstance.getValue();
        const startOffset = editorInstance.getModel()?.getOffsetAt(selection.getStartPosition()) || 0;
        const endOffset = editorInstance.getModel()?.getOffsetAt(selection.getEndPosition()) || 0;
        const text = currentValue.substring(startOffset, endOffset);
        setSelectedText(text);
      } else {
        setSelectedText('');
      }
    });

    editorInstance.getModel()?.onDidChangeContent(() => {
      const newLineCount = editorInstance.getModel()?.getLineCount() || 1;
      setLineCount(newLineCount);
    });
  }, [isReadOnly]);

  const handleFormat = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
      }, 10);
    }
  }, []);

  const handleFind = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        editorRef.current?.getAction('actions.find')?.run();
      }, 10);
    }
  }, []);

  const handleReplace = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.startFindReplaceAction')?.run();
      }, 10);
    }
  }, []);

  const handleGoToLine = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.gotoLine')?.run();
      }, 10);
    }
  }, []);

  const handleCommandPalette = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.quickCommand')?.run();
      }, 10);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: 14 + (newZoom - 100) / 10 });
    }
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: 14 + (newZoom - 100) / 10 });
    }
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleThemeChange = useCallback((newTheme: string) => {
    setCurrentTheme(newTheme);
    onThemeChange?.(newTheme);
  }, [onThemeChange]);

  const validateCode = useCallback((code: string) => {
    const errors: CodeValidationError[] = [];

    if (language === 'python') {
      const openBrackets = (code.match(/[\(\[\{]/g) || []).length;
      const closeBrackets = (code.match(/[\)\]\}]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push({
          line: 1,
          column: 1,
          message: 'Số ngoặc không khớp',
          severity: 'error',
        });
      }

      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trimStart();
        if (trimmed && !trimmed.startsWith('#')) {
          const indent = line.length - trimmed.length;
          if (indent % 4 !== 0) {
            errors.push({
              line: idx + 1,
              column: indent,
              message: 'Thụt đầu dòng không hợp lệ (phải là bội của 4)',
              severity: 'warning',
            });
          }
        }
      });
    }

    setValidationErrors(errors);
    onValidate?.(errors);
  }, [language, onValidate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      validateCode(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, validateCode]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current && validationErrors.length > 0) {
      const markers = validationErrors.map((error) => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: 999,
        message: error.message,
        severity:
          error.severity === 'error'
            ? 8
            : error.severity === 'warning'
              ? 4
              : 1,
      }));

      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'validation', markers);
      }
    }
  }, [validationErrors]);

  return (
    <Stack gap="md" className={styles.editorContainer} data-theme={currentTheme}>
      <div className={styles.toolbar}>
        <Group justify="space-between" wrap="wrap" gap="xs">
          <div className={styles.toolbarGroup}>
            <Text size="sm" fw={500} c="dimmed">
              Chủ đề:
            </Text>
            <SegmentedControl
              value={currentTheme}
              onChange={handleThemeChange}
              data={[
                {
                  label: '☀️ Sáng',
                  value: 'vs-light',
                  disabled: isLoading,
                },
                {
                  label: '🌙 Tối',
                  value: 'vs-dark',
                  disabled: isLoading,
                },
                {
                  label: '🔷 Tương phản cao',
                  value: 'hc-black',
                  disabled: isLoading,
                },
              ]}
              size="xs"
              disabled={isLoading}
              classNames={{
                root: styles.segmentedControl,
              }}
            />
          </div>

          <div className={styles.toolbarGroup}>
            <Tooltip label="Phóng to" withArrow>
              <Button
                variant="subtle"
                size="xs"
                onClick={handleZoomIn}
                disabled={isLoading || zoom >= 200}
                leftSection={<IconZoomIn size={16} />}
              >
                {zoom}%
              </Button>
            </Tooltip>
            <Tooltip label="Thu nhỏ" withArrow>
              <Button
                variant="subtle"
                size="xs"
                onClick={handleZoomOut}
                disabled={isLoading || zoom <= 50}
                leftSection={<IconZoomOut size={16} />}
              />
            </Tooltip>
          </div>

          <Group gap="xs" className={styles.toolbarGroup}>
            <Badge size="sm" variant="light">
              {lineCount} dòng
            </Badge>
            {selectedText && (
              <Badge size="sm" variant="light">
                {selectedText.length} ký tự được chọn
              </Badge>
            )}
            {validationErrors.length > 0 && (
              <Badge size="sm" color="red" variant="light">
                {validationErrors.length} lỗi
              </Badge>
            )}
          </Group>
        </Group>

        <Group gap="xs" mt="md" wrap="wrap">
          <Tooltip label={<Kbd size="xs">Ctrl+Shift+F</Kbd>} withArrow>
            <Button
              variant="light"
              size="xs"
              onClick={handleFormat}
              disabled={isLoading || isReadOnly}
              leftSection={<IconCode size={14} />}
            >
              Định dạng
            </Button>
          </Tooltip>

          <Tooltip label={<Kbd size="xs">Ctrl+F</Kbd>} withArrow>
            <Button
              variant="light"
              size="xs"
              onClick={handleFind}
              disabled={isLoading}
              leftSection={<IconSearch size={14} />}
            >
              Tìm
            </Button>
          </Tooltip>

          <Tooltip label={<Kbd size="xs">Ctrl+H</Kbd>} withArrow>
            <Button
              variant="light"
              size="xs"
              onClick={handleReplace}
              disabled={isLoading || isReadOnly}
              leftSection={<IconBraces size={14} />}
            >
              Thay thế
            </Button>
          </Tooltip>

          <Tooltip label={<Kbd size="xs">Ctrl+G</Kbd>} withArrow>
            <Button
              variant="light"
              size="xs"
              onClick={handleGoToLine}
              disabled={isLoading}
              leftSection={<IconListCheck size={14} />}
            >
              Đi tới dòng
            </Button>
          </Tooltip>

          <Tooltip label={<Kbd size="xs">Ctrl+Shift+P</Kbd>} withArrow>
            <Button
              variant="light"
              size="xs"
              onClick={handleCommandPalette}
              disabled={isLoading}
              leftSection={<IconKeyboard size={14} />}
            >
              Command
            </Button>
          </Tooltip>

          {/* {showKeyboardShortcuts && (
            <Button
              variant="subtle"
              size="xs"
              onClick={() => _setIsShortcutsOpen(!isShortcutsOpen)}
              rightSection={isShortcutsOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            >
              Phím tắt
            </Button>
          )} */}
        </Group>
      </div>

      {showKeyboardShortcuts && (
        <div className={`${styles.shortcutsPanel} ${isShortcutsOpen ? styles.shortcutsPanelOpen : styles.shortcutsPanelClosed}`}>
          <Group grow gap="md">
            {KEYBOARD_SHORTCUTS.map((category) => (
              <div key={category.category} className={styles.shortcutsCategory}>
                <Text size="sm" fw={600} mb="xs">
                  {category.category}
                </Text>
                <div className={styles.shortcutsList}>
                  {category.shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className={styles.shortcutItem}>
                      <Kbd size="xs">{shortcut.key}</Kbd>
                      <Text size="xs" c="dimmed">
                        {shortcut.action}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Group>
        </div>
      )}

      <Box
        className={`${styles.editorWrapper} ${validationErrors.length > 0 ? styles.hasErrors : ''}`}
        style={{
          minHeight,
          border: '1px solid var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-sm)',
          overflow: 'hidden',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange?.(val || '')}
          onMount={handleEditorMount}
          theme={currentTheme}
          options={{
            minimap: { enabled: true, size: 'proportional' },
            fontSize: 14,
            lineHeight: 1.6,
            lineNumbers: 'on',
            lineDecorationsWidth: 10,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            scrollBeyondLastLine: false,
            roundedSelection: false,
            readOnly: isReadOnly,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            wordWrapColumn: 120,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            snippetSuggestions: 'inline',
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            quickSuggestionsDelay: 10,
            formatOnType: true,
            formatOnPaste: true,
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoClosingComments: 'always',
            autoSurround: 'languageDefined',
            find: {
              seedSearchStringFromSelection: 'selection',
              autoFindInSelection: 'never',
              addExtraSpaceOnTop: true,
            },
            renderLineHighlight: 'all',
            renderControlCharacters: false,
            renderWhitespace: 'none',
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            cursorStyle: 'line',
            cursorWidth: 2,
            scrollbar: {
              horizontal: 'auto',
              vertical: 'auto',
              useShadows: true,
              verticalSliderSize: 12,
              horizontalSliderSize: 12,
            },
            accessibilitySupport: 'on',
            screenReaderAnnounceInlineSuggestion: true,
            fontLigatures: true,
            showUnused: true,
            hover: { enabled: true, delay: 300, sticky: true },
          }}
          loading={
            <Box className={styles.loadingState}>
              <Text>Đang tải trình soạn thảo...</Text>
            </Box>
          }
        />
      </Box>

      {validationErrors.length > 0 && (
        <div className={styles.errorsPanel}>
          <Text size="sm" fw={600} mb="xs">
            Phát hiện {validationErrors.length} lỗi:
          </Text>
          <Stack gap="xs">
            {validationErrors.map((error, idx) => (
              <Group key={idx} gap="sm" wrap="nowrap" className={styles.errorItem}>
                <Badge
                  size="sm"
                  color={error.severity === 'error' ? 'red' : error.severity === 'warning' ? 'orange' : 'blue'}
                >
                  {error.severity === 'error' ? 'LỖI' : error.severity === 'warning' ? 'CẢNH BÁO' : 'THÔNG TIN'}
                </Badge>
                <div>
                  <Text size="sm" fw={500}>
                    Dòng {error.line}, Cột {error.column}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {error.message}
                  </Text>
                </div>
              </Group>
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}
