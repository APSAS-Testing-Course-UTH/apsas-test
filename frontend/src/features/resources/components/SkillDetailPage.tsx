import { Stack, Badge, Group, Button, Text, Loader, Center, Alert, Breadcrumbs, Anchor, Title, Grid } from '@mantine/core'
import { IconDownload, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import ReactMarkdown from 'react-markdown'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import type { ContentServiceSkillResponse } from '@/api/types.gen'
import { useSkillDetailQuery } from '../api/hooks'
import { useToast } from '@/components/hooks/useToast'
import { ResourceTableOfContents, type Heading } from './ResourceTableOfContents'
import { useState, useEffect, useRef } from 'react'
import styles from './ResourceDetailModal.module.css'

/**
 * Full-page component to display skill details with markdown content rendering
 * Fetches skill data dynamically and displays complete content
 * Features:
 * - Loading state with spinner
 * - Error handling with retry option
 * - Markdown rendering with custom styling
 * - Breadcrumb navigation
 * - Download functionality
 * - Back button to resources list
 * - Vietnamese UI throughout
 * - Table of Contents for navigation
 */
export function SkillDetailPage() {
  const { id: skillId } = useParams({ from: '/_authenticated/student/resources/skills/$id' })
  const navigate = useNavigate()
  const { show } = useToast()

  // State for TOC tracking
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  // Fetch skill details
  const { data: skill, isLoading, error, refetch } = useSkillDetailQuery(skillId)

  // Helper function to extract headings from DOM
  const extractHeadings = () => {
    if (!contentRef.current) return []

    const h2Elements = contentRef.current.querySelectorAll('h2')
    const h3Elements = contentRef.current.querySelectorAll('h3')

    const extractedHeadings: Heading[] = []
    let counter = 0

    h2Elements.forEach((el) => {
      const id = `heading-${counter}`
      counter++

      if (!el.id) {
        el.id = id
      }

      extractedHeadings.push({
        id: el.id,
        text: el.textContent || '',
        level: 2,
      })
    })

    h3Elements.forEach((el) => {
      const id = `heading-${counter}`
      counter++

      if (!el.id) {
        el.id = id
      }

      extractedHeadings.push({
        id: el.id,
        text: el.textContent || '',
        level: 3,
      })
    })

    return extractedHeadings
  }

  // Reset headings when skill changes
  useEffect(() => {
    setHeadings([])
    setActiveHeadingId('')
  }, [skillId])

  // Extract headings from DOM after markdown renders
  useEffect(() => {
    if (!contentRef.current) return

    // Small delay to ensure ReactMarkdown has fully rendered
    const timeoutId = setTimeout(() => {
      const extractedHeadings = extractHeadings()
      if (extractedHeadings.length > 0) {
        setHeadings(extractedHeadings)
      }
    }, 100)



    return () => {
      clearTimeout(timeoutId)
    }
  }, [skill])

  // Setup scroll listener for active heading tracking
  useEffect(() => {
    const handleScroll = () => {
      if (headings.length === 0) return

      // Find the heading that is currently in viewport
      // Check multiple headings to find the topmost one visible
      let closestHeading: string | null = null
      let closestDistance = Number.MAX_VALUE

      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          // If heading is visible in upper portion of viewport
          if (rect.top < 300 && rect.bottom > 0) {
            const distance = Math.abs(rect.top)
            // Find the heading closest to the top
            if (distance < closestDistance) {
              closestDistance = distance
              closestHeading = heading.id
            }
          }
        }
      }

      if (closestHeading) {
        setActiveHeadingId(closestHeading)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // Handle download
  const handleDownload = (resource: ContentServiceSkillResponse) => {
    try {
      const element = document.createElement('a')
      const file = new Blob([resource.description || ''], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${resource.name || 'skill'}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(element.href)
      show({
        type: 'success',
        title: 'Thành công',
        message: 'Đã tải xuống kỹ năng',
      })
    } catch (err) {
      show({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải xuống kỹ năng',
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="lg">
          <Loader size="lg" />
          <Text c="dimmed">Đang tải chi tiết kỹ năng...</Text>
        </Stack>
      </Center>
    )
  }

  // Error state
  if (error || !skill) {
    return (
      <Stack gap="lg">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Không thể tải kỹ năng"
          color="red"
          variant="light"
        >
          {error?.message || 'Không thể tải chi tiết kỹ năng. Vui lòng thử lại.'}
        </Alert>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: '/student/resources' })}
          >
            Quay lại
          </Button>
          <Button onClick={() => refetch()}>
            Thử lại
          </Button>
        </Group>
      </Stack>
    )
  }

  // Format date
  const createdDate = skill.createdAt
    ? new Date(skill.createdAt).toLocaleDateString('vi-VN')
    : 'N/A'

  // Render skill details
  return (
    <Stack gap="lg">
      {/* Breadcrumb navigation */}
      <Breadcrumbs>
        <Anchor component={Link} to="/student/resources">
          Tài nguyên
        </Anchor>
        <Anchor component={Link} to="/student/resources">
          Kỹ năng
        </Anchor>
        <Text c="dimmed">{skill.name}</Text>
      </Breadcrumbs>

      {/* Header with back button */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1} mb="sm">
            {skill.name || 'Chi tiết kỹ năng'}
          </Title>
          <Group gap="sm">
            <Badge size="sm" variant="light" color="cyan">
              Kỹ năng
            </Badge>
            <Text size="sm" c="dimmed">
              Tạo: {createdDate}
            </Text>
          </Group>
        </div>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate({ to: '/student/resources' })}
        >
          Quay lại
        </Button>
      </Group>

      {/* Content with markdown rendering and TOC */}
      <Grid columns={12} gutter="lg">
        {/* Main content */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <div className={styles.contentWrapper} ref={contentRef}>
            {skill.description ? (
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className={styles.heading1} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className={styles.heading2} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className={styles.heading3} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className={styles.paragraph} {...props} />
                  ),
                  code: ({ inline, ...props }: any) => (
                    <code
                      className={inline ? styles.inlineCode : styles.codeBlock}
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className={styles.preBlock} {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className={styles.unorderedList} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className={styles.orderedList} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className={styles.listItem} {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className={styles.blockquote} {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table className={styles.table} {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {skill.description}
              </ReactMarkdown>
            ) : (
              <Text c="dimmed">Không có nội dung</Text>
            )}
          </div>
        </Grid.Col>

        {/* Table of Contents Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <ResourceTableOfContents
            headings={headings}
            activeHeadingId={activeHeadingId}
          />
        </Grid.Col>
      </Grid>

      {/* Action buttons */}
      <Group justify="flex-end" gap="sm">
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate({ to: '/student/resources' })}
        >
          Quay lại
        </Button>
        <Button
          leftSection={<IconDownload size={16} />}
          onClick={() => handleDownload(skill)}
        >
          Tải xuống
        </Button>
      </Group>
    </Stack>
  )
}
