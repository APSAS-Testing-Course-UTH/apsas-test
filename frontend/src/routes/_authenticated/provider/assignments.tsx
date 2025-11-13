import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Flex } from '@mantine/core'

/**
 * Provider Assignments Parent Route
 * 
 * Routes:
 * - /provider/assignments - List page (rendered at index.tsx)
 * - /provider/assignments/create - Create form
 * - /provider/assignments/:id - Edit form
 * 
 * Child routes render in the <Outlet /> below
 * Note: ContentProviderLayout is already applied at the provider level
 */
const ProviderAssignmentsPage = () => {

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <div>
            <Title order={1}>Bài tập</Title>
            <Text c="dimmed" mt="xs">
              Quản lý bài tập và nội dung giáo dục
            </Text>
          </div>
        </Flex>

        {/* Child routes (list, create, edit) render here */}
        <Outlet />
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/provider/assignments')(
  {
    component: ProviderAssignmentsPage,
  }
)
