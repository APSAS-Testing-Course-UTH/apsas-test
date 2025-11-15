import { Card, Text, Group, Stack, Box, Badge, Divider, Button } from '@mantine/core'
import { IconMessageCircle } from '@tabler/icons-react'
import styles from './InstructorFeedback.module.css'

/**
 * InstructorFeedback Component
 * 
 * Displays instructor feedback on student submissions with:
 * - Multiple feedback entries support
 * - Instructor name and timestamp for each entry
 * - Timeline-style display (newest first)
 * - Empty state when no feedback
 * - Vietnamese UI
 * 
 * @example
 * ```tsx
 * <InstructorFeedback
 *   feedback="─────────────────────────────\n📝 Phản hồi từ Bịp Instructor - 21:13 14/11/2025\nGreat work!"
 * />
 * ```
 */

export interface InstructorFeedbackProps {
  /** Feedback content - can contain multiple entries separated by delimiters */
  feedback?: string
  /** @deprecated Not used anymore - instructor info parsed from feedback */
  instructor?: {
    name: string
    avatar?: string
  }
  /** @deprecated Not used anymore - timestamp parsed from feedback */
  createdAt?: Date
  /** Callback when user clicks provide feedback button */
  onProvideFeedback?: () => void
}

interface ParsedFeedback {
  instructor: string
  timestamp: string
  content: string
}

const labels = {
  title: 'Phản hồi từ giáo viên',
  noFeedback: 'Chưa có phản hồi nào',
}

/**
 * Parse feedback string to extract multiple feedback entries
 * Format: ─────────────────────────────\n📝 Phản hồi từ [Name] - [Timestamp]\n[Content]
 */
function parseFeedbackEntries(feedback: string): ParsedFeedback[] {
  const entries: ParsedFeedback[] = []
  
  // Split by separator line to get individual feedback sections
  const parts = feedback.split('─────────────────────────────')
  
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    
    // Try to match new format: 📝 Phản hồi từ [Name] - [Timestamp]\n[Content...]
    const newFormatMatch = trimmed.match(/^📝\s*Phản hồi từ\s+(.+?)\s+-\s+(.+?)\s*\n([\s\S]+)$/)
    
    if (newFormatMatch) {
      const content = newFormatMatch[3].trim()
      
      // Check if this content contains old feedback (separated by double newline)
      // Pattern: [New content]\n\n[Old feedback without metadata]
      const contentParts = content.split(/\n\n+/)
      
      if (contentParts.length > 1) {
        // First part is the actual new feedback
        entries.push({
          instructor: newFormatMatch[1].trim(),
          timestamp: newFormatMatch[2].trim(),
          content: contentParts[0].trim(),
        })
        
        // Remaining parts are old feedbacks (might be multiple if concatenated multiple times)
        for (let i = 1; i < contentParts.length; i++) {
          const oldContent = contentParts[i].trim()
          if (oldContent) {
            // Check if this old content has metadata (from previous concatenation)
            const oldFormatMatch = oldContent.match(/^📝\s*Phản hồi từ\s+(.+?)\s+-\s+(.+?)\s*\n([\s\S]+)$/)
            
            if (oldFormatMatch) {
              entries.push({
                instructor: oldFormatMatch[1].trim(),
                timestamp: oldFormatMatch[2].trim(),
                content: oldFormatMatch[3].trim(),
              })
            } else {
              // Legacy feedback without any metadata
              entries.push({
                instructor: 'Giảng viên',
                timestamp: '',
                content: oldContent,
              })
            }
          }
        }
      } else {
        // Single feedback with metadata
        entries.push({
          instructor: newFormatMatch[1].trim(),
          timestamp: newFormatMatch[2].trim(),
          content: content,
        })
      }
    } else {
      // Legacy feedback without metadata (original feedback before adding metadata feature)
      entries.push({
        instructor: 'Giảng viên',
        timestamp: '',
        content: trimmed,
      })
    }
  }
  
  return entries
}

export function InstructorFeedback({
  feedback,
  onProvideFeedback,
}: InstructorFeedbackProps) {
  // Parse feedback entries (empty array if no feedback)
  const entries = feedback && feedback.trim().length > 0 
    ? parseFeedbackEntries(feedback) 
    : []

  return (
    <Stack gap="md">
      {/* Header with Provide Feedback Button */}
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <IconMessageCircle size={20} />
          <Text fw={600} size="lg">
            {labels.title}
          </Text>
          <Badge size="sm" variant="light" color="blue">
            {entries.length}
          </Badge>
        </Group>
        
        {onProvideFeedback && (
          <Button
            leftSection={<IconMessageCircle size={16} />}
            onClick={onProvideFeedback}
            size="sm"
          >
            Cung cấp phản hồi
          </Button>
        )}
      </Group>

      {/* Feedback Entries */}
      {entries.length === 0 ? (
        <Box py="xl">
          <Text c="dimmed" ta="center">
            {labels.noFeedback}
          </Text>
        </Box>
      ) : (
        <Stack gap="sm">
          {entries.map((entry, index) => (
            <Card
              key={index}
              role="article"
              withBorder
              shadow="xs"
              radius="md"
              className={styles.feedbackCard}
            >
              <Stack gap="xs">
                {/* Entry Header */}
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs">
                    <Text size="sm" fw={600} c="blue">
                      {entry.instructor}
                    </Text>
                    {entry.timestamp && (
                      <>
                        <Text size="xs" c="dimmed">
                          •
                        </Text>
                        <Text size="xs" c="dimmed">
                          {entry.timestamp}
                        </Text>
                      </>
                    )}
                  </Group>
                  {index === 0 && (
                    <Badge size="xs" variant="dot" color="green">
                      Mới nhất
                    </Badge>
                  )}
                </Group>

                {/* Divider */}
                <Divider />

                {/* Entry Content */}
                <Box className={styles.feedbackContent}>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {entry.content}
                  </Text>
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
