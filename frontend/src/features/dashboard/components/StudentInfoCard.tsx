import { Avatar, Card, Stack, Text, Badge, Group, Title, Skeleton } from '@mantine/core'
import { IconMail, IconUser, IconCalendar } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { identityServiceGetCurrentUser } from '@/api/sdk.gen'
import type { IdentityServiceUserResponse } from '@/api/types.gen'
import classes from './StudentInfoCard.module.css'

/**
 * StudentInfoCard - Thẻ hiển thị thông tin sinh viên
 * 
 * Hiển thị:
 * - Avatar của sinh viên
 * - Họ và tên
 * - Email
 * - Vai trò (Role)
 * - Ngày tạo tài khoản
 * 
 * @example
 * ```tsx
 * <StudentInfoCard />
 * ```
 */
export function StudentInfoCard() {
  // Fetch current user data
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => identityServiceGetCurrentUser(),
  })

  const user = response?.data as IdentityServiceUserResponse | undefined

  if (isLoading) {
    return (
      <Card withBorder shadow="sm" p="lg" className={classes.card}>
        <Stack gap="md">
          <Skeleton height={60} circle />
          <Skeleton height={16} width="60%" />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="70%" />
        </Stack>
      </Card>
    )
  }

  if (error || !user) {
    return (
      <Card withBorder shadow="sm" p="lg" className={classes.card}>
        <Text c="red" size="sm">
          Không thể tải thông tin sinh viên
        </Text>
      </Card>
    )
  }

  // Format created date
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'

  return (
    <Card withBorder shadow="sm" p="lg" className={classes.card}>
      <Stack gap="md">
        {/* Header with Avatar and Basic Info */}
        <Group>
          <Avatar
            name={`${user.firstName} ${user.lastName}`.trim() || 'Sinh viên'}
            color="initials"
            size="lg"
            radius="md"
          />
          <Stack gap={4}>
            <Title order={3} className={classes.name}>
              {user.firstName} {user.lastName}
            </Title>
            <Badge
              size="sm"
              variant="light"
              color={user.role === 'STUDENT' ? 'blue' : 'gray'}
            >
              {user.role === 'STUDENT' ? 'Sinh viên' : user.role}
            </Badge>
          </Stack>
        </Group>

        {/* Email */}
        <Group gap="xs">
          <IconMail size={18} className={classes.icon} />
          <div>
            <Text size="xs" c="dimmed" className={classes.label}>
              Email
            </Text>
            <Text size="sm" fw={500} className={classes.value}>
              {user.email || 'N/A'}
            </Text>
          </div>
        </Group>

        {/* Account Status */}
        <Group gap="xs">
          <IconUser size={18} className={classes.icon} />
          <div>
            <Text size="xs" c="dimmed" className={classes.label}>
              Trạng thái tài khoản
            </Text>
            <Group gap="xs">
              <Badge
                size="xs"
                color={user.isActive ? 'green' : 'red'}
                variant="dot"
              >
                {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </Badge>
              <Badge
                size="xs"
                color={user.isEmailVerified ? 'green' : 'yellow'}
                variant="dot"
              >
                {user.isEmailVerified ? 'Email xác minh' : 'Email chưa xác minh'}
              </Badge>
            </Group>
          </div>
        </Group>

        {/* Enrollment Date */}
        <Group gap="xs">
          <IconCalendar size={18} className={classes.icon} />
          <div>
            <Text size="xs" c="dimmed" className={classes.label}>
              Ngày tạo tài khoản
            </Text>
            <Text size="sm" fw={500} className={classes.value}>
              {createdDate}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  )
}
