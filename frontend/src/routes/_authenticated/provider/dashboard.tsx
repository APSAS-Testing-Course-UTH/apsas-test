import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  Container, 
  Stack, 
  Title, 
  Text, 
  Grid, 
  Card, 
  Badge, 
  Group, 
  Skeleton,
  Button,
  ThemeIcon,
  SimpleGrid,
  Paper,
  Divider,
  Avatar,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import { 
  IconFileText, 
  IconBulb, 
  IconBook, 
  IconFilePlus,
  IconPlus,
  IconChartBar,
  IconArrowRight,
  IconEye,
} from '@tabler/icons-react'
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

  // Calculate additional statistics
  const totalContent = Number(assignmentsData?.totalElements || 0) + Number(skillsData?.totalElements || 0) + Number(tutorialsData?.totalElements || 0)
  // const publishedRate = assignments.length > 0 
  //   ? Math.round((publishedAssignments / assignments.length) * 100) 
  //   : 0 // Not currently displayed

  // Get recent items (last 3 of each)
  const recentAssignments = assignments.slice(0, 3)
  const recentSkills = skills.slice(0, 3)
  const recentTutorials = tutorials.slice(0, 3)

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header with Quick Actions */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Bảng điều khiển</Title>
            <Text c="dimmed" mt="xs">
              Chào mừng trở lại! Quản lý nội dung và theo dõi thống kê của bạn
            </Text>
          </div>
          <Group gap="sm">
            <Button
              component={Link}
              to="/provider/assignments/create"
              leftSection={<IconFilePlus size={18} />}
              variant="filled"
            >
              Tạo bài tập
            </Button>
            <Button
              component={Link}
              to="/provider/skills/create"
              leftSection={<IconPlus size={18} />}
              variant="light"
            >
              Thêm kỹ năng
            </Button>
            <Button
              component={Link}
              to="/provider/tutorials/create"
              leftSection={<IconPlus size={18} />}
              variant="light"
            >
              Thêm hướng dẫn
            </Button>
          </Group>
        </Group>

        {/* Enhanced Statistics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {/* Assignments Card */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Bài tập
              </Text>
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconFileText size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs" mb="xs">
              <Text size="xl" fw={700}>
                {assignments.length}
              </Text>
              <Text size="sm" c="dimmed" mb={2}>
                tổng số
              </Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" color="blue" variant="light">
                {publishedAssignments} xuất bản
              </Badge>
              {draftAssignments > 0 && (
                <Badge size="sm" color="yellow" variant="light">
                  {draftAssignments} nháp
                </Badge>
              )}
            </Group>
          </Paper>

          {/* Skills Card */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Kỹ năng
              </Text>
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconBulb size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs" mb="xs">
              <Text size="xl" fw={700}>
                {skills.length}
              </Text>
              <Text size="sm" c="dimmed" mb={2}>
                tài nguyên
              </Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" color="teal" variant="light">
                Hoạt động
              </Badge>
            </Group>
          </Paper>

          {/* Tutorials Card */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Hướng dẫn
              </Text>
              <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                <IconBook size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs" mb="xs">
              <Text size="xl" fw={700}>
                {tutorials.length}
              </Text>
              <Text size="sm" c="dimmed" mb={2}>
                học liệu
              </Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" color="violet" variant="light">
                Học tập
              </Badge>
            </Group>
          </Paper>

          {/* Total Content Card */}
          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Tổng nội dung
              </Text>
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconChartBar size={20} stroke={1.5} />
              </ThemeIcon>
            </Group>
            <Group align="flex-end" gap="xs" mb="xs">
              <Text size="xl" fw={700}>
                {totalContent}
              </Text>
              <Text size="sm" c="dimmed" mb={2}>
                items
              </Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" color="orange" variant="light">
                Tất cả
              </Badge>
            </Group>
          </Paper>
        </SimpleGrid>

        <Grid>
          {/* Recent Assignments */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card withBorder h="100%">
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconFileText size={20} stroke={1.5} />
                    <Text fw={600}>Bài tập gần đây</Text>
                  </Group>
                  <Button
                    component={Link}
                    to="/provider/assignments"
                    variant="subtle"
                    size="xs"
                    rightSection={<IconArrowRight size={14} />}
                  >
                    Xem tất cả
                  </Button>
                </Group>
                <Divider />
                {recentAssignments.length > 0 ? (
                  <Stack gap="sm">
                    {recentAssignments.map((assignment) => (
                      <Paper key={assignment.id} p="sm" withBorder radius="sm">
                        <Group justify="space-between" align="flex-start">
                          <div style={{ flex: 1 }}>
                            <Group gap="xs" mb="xs">
                              <Text size="sm" fw={500} lineClamp={1}>
                                {assignment.title}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Badge 
                                size="xs" 
                                color={assignment.status === 'PUBLISHED' ? 'green' : 'gray'}
                                variant="light"
                              >
                                {assignment.status === 'PUBLISHED' ? 'Xuất bản' : 'Nháp'}
                              </Badge>
                              <Badge size="xs" variant="light">
                                {assignment.difficultyLevel || 'N/A'}
                              </Badge>
                            </Group>
                          </div>
                          <Group gap="xs">
                            <Tooltip label="Xem chi tiết">
                              <ActionIcon
                                component="a"
                                href={`/provider/assignments/${assignment.id}`}
                                variant="subtle"
                                size="sm"
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper p="xl" withBorder radius="md">
                    <Stack align="center" gap="xs">
                      <IconFileText size={40} stroke={1.5} color="var(--mantine-color-dimmed)" />
                      <Text size="sm" c="dimmed" ta="center">
                        Chưa có bài tập nào
                      </Text>
                      <Button
                        component={Link}
                        to="/provider/assignments/create"
                        variant="light"
                        size="xs"
                        leftSection={<IconPlus size={16} />}
                      >
                        Tạo bài tập đầu tiên
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Recent Skills & Tutorials */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="md" h="100%">
              {/* Recent Skills */}
              <Card withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconBulb size={20} stroke={1.5} />
                      <Text fw={600}>Kỹ năng mới nhất</Text>
                    </Group>
                    <Button
                      component={Link}
                      to="/provider/skills"
                      variant="subtle"
                      size="xs"
                      rightSection={<IconArrowRight size={14} />}
                    >
                      Xem tất cả
                    </Button>
                  </Group>
                  <Divider />
                  {recentSkills.length > 0 ? (
                    <Stack gap="xs">
                      {recentSkills.map((skill) => (
                        <Group key={skill.id} justify="space-between">
                          <Group gap="xs">
                            <Avatar size="sm" radius="sm" color="teal">
                              {(skill.name || 'S').charAt(0)}
                            </Avatar>
                            <Text size="sm">{skill.name}</Text>
                          </Group>
                          <ActionIcon
                            component="a"
                            href={`/provider/skills/${skill.id}`}
                            variant="subtle"
                            size="sm"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      Chưa có kỹ năng nào
                    </Text>
                  )}
                </Stack>
              </Card>

              {/* Recent Tutorials */}
              <Card withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconBook size={20} stroke={1.5} />
                      <Text fw={600}>Hướng dẫn mới nhất</Text>
                    </Group>
                    <Button
                      component={Link}
                      to="/provider/tutorials"
                      variant="subtle"
                      size="xs"
                      rightSection={<IconArrowRight size={14} />}
                    >
                      Xem tất cả
                    </Button>
                  </Group>
                  <Divider />
                  {recentTutorials.length > 0 ? (
                    <Stack gap="xs">
                      {recentTutorials.map((tutorial) => (
                        <Group key={tutorial.id} justify="space-between">
                          <Group gap="xs">
                            <Avatar size="sm" radius="sm" color="violet">
                              {(tutorial.title || 'T').charAt(0)}
                            </Avatar>
                            <Text size="sm" lineClamp={1}>
                              {tutorial.title}
                            </Text>
                          </Group>
                          <ActionIcon
                            component="a"
                            href={`/provider/tutorials/${tutorial.id}`}
                            variant="subtle"
                            size="sm"
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      Chưa có hướng dẫn nào
                    </Text>
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Quick Actions Card */}
        <Card withBorder>
          <Stack gap="md">
            <div>
              <Text fw={600} size="lg">Hành động nhanh</Text>
              <Text size="sm" c="dimmed" mt="xs">
                Tạo nội dung mới hoặc quản lý tài nguyên hiện có
              </Text>
            </div>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              <Button
                component={Link}
                to="/provider/assignments/create"
                variant="light"
                fullWidth
                leftSection={<IconFilePlus size={18} />}
                size="md"
              >
                Tạo bài tập mới
              </Button>
              <Button
                component={Link}
                to="/provider/skills/create"
                variant="light"
                fullWidth
                leftSection={<IconBulb size={18} />}
                size="md"
                color="teal"
              >
                Thêm kỹ năng
              </Button>
              <Button
                component={Link}
                to="/provider/tutorials/create"
                variant="light"
                fullWidth
                leftSection={<IconBook size={18} />}
                size="md"
                color="violet"
              >
                Tạo hướng dẫn
              </Button>
            </SimpleGrid>
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
