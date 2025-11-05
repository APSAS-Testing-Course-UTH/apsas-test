import {
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import {
  Button,
  CopyButton,
  Tooltip,
  Group,
  Stack,
  Text,
  Loader,
  Center,
  Card,
} from '@mantine/core';
import {
  IconDownload,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import styles from './CodeDisplay.module.css';

/**
 * CodeDisplay - Read-only code viewer with syntax highlighting
 *
 * Displays submitted code with syntax highlighting for 50+ programming languages.
 * Supports line numbers, copy to clipboard, and download functionality.
 *
 * Features:
 * - Syntax highlighting via PrismJS (50+ languages)
 * - Line numbers (toggleable)
 * - Language auto-detection (via language parameter or from code)
 * - Copy to clipboard with Mantine CopyButton
 * - Download code as file
 * - Vietnamese UI labels
 * - Accessible with ARIA labels
 * - Responsive design (mobile to desktop)
 *
 * Vietnamese UI: All labels and messages in Vietnamese
 *
 * @example
 * ```tsx
 * <CodeDisplay
 *   code="console.log('Hello, World!');"
 *   language="javascript"
 *   showLineNumbers={true}
 *   showCopyButton={true}
 *   showDownloadButton={true}
 * />
 * ```
 */

interface CodeDisplayProps {
  /** Code content to display (required) */
  code: string;

  /** Programming language (optional - auto-detected if not provided) */
  language?: string;

  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;

  /** Read-only display (default: true) */
  readOnly?: boolean;

  /** Show copy button (default: true) */
  showCopyButton?: boolean;

  /** Show download button (default: false) */
  showDownloadButton?: boolean;

  /** Filename for download (default: 'code') */
  downloadFilename?: string;

  /** Additional CSS class */
  className?: string;

  /** Callback when code is copied */
  onCopySuccess?: () => void;

  /** Callback when code is downloaded */
  onDownload?: (filename: string) => void;

  /** Is loading state */
  isLoading?: boolean;
}

// Vietnamese UI Labels
const UI_LABELS = {
  copy: 'Sao chép',
  copied: 'Đã sao chép!',
  download: 'Tải xuống',
  downloadError: 'Lỗi tải xuống',
  readOnly: 'Chỉ xem',
  submittedCode: 'Mã đã nộp',
  noCode: 'Không có mã để hiển thị',
  language: 'Ngôn ngữ',
  lineNumbers: 'Số dòng',
};

// Language mapping: Runtime language → PrismJS language
const LANGUAGE_MAP: Record<string, string> = {
  'python': 'python',
  'python3': 'python',
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'java': 'java',
  'cpp': 'cpp',
  'c++': 'cpp',
  'c': 'c',
  'csharp': 'csharp',
  'c#': 'csharp',
  'php': 'php',
  'ruby': 'ruby',
  'go': 'go',
  'rust': 'rust',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'objective-c': 'objectivec',
  'r': 'r',
  'matlab': 'matlab',
  'sql': 'sql',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'sass': 'sass',
  'bash': 'bash',
  'shell': 'bash',
  'sh': 'bash',
  'powershell': 'powershell',
  'xml': 'xml',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'markdown': 'markdown',
  'md': 'markdown',
  'latex': 'latex',
  'tex': 'latex',
  'dockerfile': 'dockerfile',
  'makefile': 'makefile',
  'gradle': 'gradle',
  'maven': 'maven',
  'nginx': 'nginx',
  'apache': 'apacheconf',
  'vim': 'vim',
  'perl': 'perl',
  'lua': 'lua',
  'clojure': 'clojure',
  'elixir': 'elixir',
  'erlang': 'erlang',
  'haskell': 'haskell',
  'scala': 'scala',
};

/**
 * Detect language from code content
 * Falls back to 'javascript' if no language provided
 */
function detectLanguage(code: string): string {
  if (!code) return 'javascript';

  // Check for common indicators in code
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('function ') || code.includes('const ') || code.includes('let '))
    return 'javascript';
  if (code.includes('public class ') || code.includes('import java.')) return 'java';
  if (code.includes('#include') || code.includes('using namespace')) return 'cpp';

  return 'javascript';
}

/**
 * Normalize language name to Prism language code
 */
function normalizeLanguage(lang?: string): string {
  if (!lang) return 'javascript';

  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || normalized || 'javascript';
}

/**
 * CodeDisplay Component
 * Read-only code viewer with syntax highlighting
 */
function CodeDisplayComponent({
  code,
  language,
  showLineNumbers = true,
  readOnly = true,
  showCopyButton = true,
  showDownloadButton = false,
  downloadFilename = 'code',
  className,
  onCopySuccess: _onCopySuccess,
  onDownload,
  isLoading = false,
}: CodeDisplayProps) {
  // Refs
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);



  // Determine language to use
  const displayLanguage = normalizeLanguage(language || detectLanguage(code));

  // Apply Prism highlighting on mount and when code/language changes
  useEffect(() => {
    if (codeRef.current && code) {
      // Set the code content
      codeRef.current.textContent = code;

      // Remove existing language classes
      codeRef.current.className = 'language-' + displayLanguage;

      // Apply Prism syntax highlighting
      try {
        Prism.highlightElement(codeRef.current, false);
      } catch (error) {
        console.error('Prism highlighting error:', error);
        // Fallback: just show the code without highlighting
      }
    }
  }, [code, displayLanguage]);



  // Handle download
  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determine file extension based on language
      const extension = displayLanguage === 'javascript' ? 'js' : displayLanguage;
      link.download = `${downloadFilename}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onDownload?.(link.download);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  }, [code, displayLanguage, downloadFilename, onDownload]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <Center style={{ minHeight: '200px' }}>
          <Loader />
        </Center>
      </Card>
    );
  }

  // Empty code
  if (!code || code.trim().length === 0) {
    return (
      <Card className={className}>
        <Text c="dimmed" size="sm">
          {UI_LABELS.noCode}
        </Text>
      </Card>
    );
  }

  // Calculate line count for line numbers
  const lineCount = code.split('\n').length;

  return (
    <Card className={`${styles.codeDisplay} ${className || ''}`}>
      {/* Header with actions */}
      <Group justify="space-between" mb="md">
        <Stack gap={0}>
          <Text size="sm" fw={500} c="dimmed">
            {UI_LABELS.submittedCode}
          </Text>
          <Text size="xs" c="gray">
            {displayLanguage} • {lineCount} {lineCount === 1 ? 'dòng' : 'dòng'}
          </Text>
        </Stack>

        <Group gap="xs">
          {showCopyButton && (
            <CopyButton value={code} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? UI_LABELS.copied : UI_LABELS.copy}
                  withArrow
                  position="left"
                >
                  <Button
                    onClick={copy}
                    variant="light"
                    size="xs"
                    leftSection={
                      copied ? (
                        <IconCheck size={14} />
                      ) : (
                        <IconCopy size={14} />
                      )
                    }
                    aria-label={UI_LABELS.copy}
                  >
                    {copied ? UI_LABELS.copied : UI_LABELS.copy}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
          )}

          {showDownloadButton && (
            <Tooltip label={UI_LABELS.download} withArrow position="left">
              <Button
                onClick={handleDownload}
                variant="light"
                size="xs"
                leftSection={<IconDownload size={14} />}
                aria-label={UI_LABELS.download}
              >
                {UI_LABELS.download}
              </Button>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Code block */}
      <div className={styles.codeBlock}>
        <pre
          ref={preRef}
          className={`${styles.pre} ${showLineNumbers ? styles.withLineNumbers : ''}`}
          aria-label={UI_LABELS.submittedCode}
        >
          <code
            ref={codeRef}
            className={`language-${displayLanguage} ${styles.code}`}
            {...(readOnly && { readOnly: true })}
          />
        </pre>
      </div>

      {/* Footer */}
      {readOnly && (
        <Text size="xs" c="dimmed" mt="sm">
          {UI_LABELS.readOnly}
        </Text>
      )}
    </Card>
  );
}

// Export memoized version to avoid unnecessary re-renders
export const CodeDisplay = memo(CodeDisplayComponent);

// Export type
export type { CodeDisplayProps };
