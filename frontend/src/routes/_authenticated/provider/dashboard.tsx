import { createFileRoute } from '@tanstack/react-router'
import { Container, Stack, Title, Text, Grid, Card, Badge, Group, Skeleton } from '@mantine/core'
import { useAssignmentsQuery } from '@/features/provider/api/useAssignmentsQuery'
import { useSkillsQuery } from '@/features/provider/api/useSkillsQuery'
import { useTutorialsQuery } from '@/features/provider/api/useTutorialsQuery'

/**
 * Provider Dashboard Route
 * Path: /provider/dashboard
 * 
 * Hiển thị tổng quan về hoạt động của provider
 * - Số lượng bài tập
 * - Số lượng kỹ năng
 * - Số lượng hướng dẫn
 * - Thống kê trạng thái
 * 
 * Note: ContentProviderLayout is already applied at the provider level
 */
const ProviderDashboardPage = () => {
  // Fetch real data from APIs
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignmentsQuery()
  const { data: skillsData, isLoading: skillsLoading } = useSkillsQuery()
  const { data: tutorialsData, isLoading: tutorialsLoading } = useTutorialsQuery()

  // Calculate statistics from real data
  const assignments = assignmentsData?.content || []
  const skills = skillsData?.content || []
  const tutorials = tutorialsData?.content || []

  const publishedAssignments = assignments.filter(a => a.status === 'PUBLISHED').length
  const draftAssignments = assignments.filter(a => a.status === 'DRAFT').length

  const isLoading = assignmentsLoading || skillsLoading || tutorialsLoading

  // Show loading state
  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Skeleton height={40} width={200} radius="md" />
          <Grid>
            {[1, 2, 3, 4].map((i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                <Skeleton height={100} radius="md" />
              </Grid.Col>
            ))}
          </Grid>
          <Skeleton height={120} radius="md" />
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Bảng điều khiển</Title>
          <Text c="dimmed" mt="xs">
            Chào mừng bạn đến với Content Provider Portal
          </Text>
        </div>

        {/* Quick Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text c="dimmed" size="sm" fw={500}>
                      Bài tập
                    </Text>
                    <Text size="xl" fw={700}>
                      {assignments.length}
                    </Text>
                  </div>
                  <Badge color="blue">{publishedAssignments} xuất bản</Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text c="dimmed" size="sm" fw={500}>
                      Kỹ năng
                    </Text>
                    <Text size="xl" fw={700}>
                      {skills.length}
                    </Text>
                  </div>
                  <Badge color="green">Tài nguyên</Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text c="dimmed" size="sm" fw={500}>
                      Hướng dẫn
                    </Text>
                    <Text size="xl" fw={700}>
                      {tutorials.length}
                    </Text>
                  </div>
                  <Badge color="cyan">Học tập</Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text c="dimmed" size="sm" fw={500}>
                      Bản nháp
                    </Text>
                    <Text size="xl" fw={700}>
                      {draftAssignments}
                    </Text>
                  </div>
                  <Badge color="yellow">Chờ xuất bản</Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Welcome Card */}
        <Card>
          <Stack gap="md">
            <div>
              <Title order={3}>Bắt đầu ngay</Title>
              <Text c="dimmed" size="sm" mt="xs">
                Bạn có thể tạo bài tập mới, quản lý nội dung, và xem thống kê
              </Text>
            </div>
            <Group gap="xs">
              <Badge color="blue">Tip: Tạo bài tập mới để bắt đầu</Badge>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export const Route = createFileRoute('/_authenticated/provider/dashboard')(
  {
    component: ProviderDashboardPage,
  }
)
