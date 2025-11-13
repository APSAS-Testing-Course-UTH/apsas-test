import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  Group,
  Button,
  Divider,
  Switch,
  SimpleGrid,
  Card,
  Badge,
  Select,
  PasswordInput,
  Tabs,
  Alert,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconLock,
  IconBell,
  IconEye,
  IconShield,
} from '@tabler/icons-react'
import { z } from 'zod'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useUpdateProfileMutation } from '../api/useUpdateProfileMutation'

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'Họ là bắt buộc'),
  lastName: z.string().min(1, 'Tên là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(8, 'Xác nhận mật khẩu là bắt buộc'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu không trùng khớp',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

/**
 * SettingsPanel Component
 * Quản lý cài đặt tài khoản, thông báo, quyền riêng tư
 *
 * @example
 * <SettingsPanel />
 */
export function SettingsPanel() {
  const { user, isAuthenticated } = useAuthStore()
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation()

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    validate: zod4Resolver(profileSchema),
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    validate: zod4Resolver(passwordSchema),
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Notification preferences
  const notificationForm = useForm({
    initialValues: {
      emailNotifications: true,
      assignmentReminders: true,
      weeklyDigest: true,
      newSkillAlerts: true,
    },
  })

  // Privacy settings
  const privacyForm = useForm({
    initialValues: {
      profileVisibility: 'private',
      allowCollaboration: true,
      shareAnalytics: false,
    },
  })

  // Update profile effect
  useEffect(() => {
    if (user) {
      profileForm.setValues({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleProfileSubmit = profileForm.onSubmit((data) => {
    updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
    })
  })

  const handlePasswordSubmit = passwordForm.onSubmit((data) => {
    // In a real app, this would call updatePassword API
    console.log('Update password:', data)
    // Show success notification
    passwordForm.reset()
  })

  const handleNotificationSave = () => {
    // Save notification preferences
    console.log('Notification preferences:', notificationForm.values)
  }

  const handlePrivacySave = () => {
    // Save privacy settings
    console.log('Privacy settings:', privacyForm.values)
  }

  if (!isAuthenticated || !user) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Lỗi" color="red">
          Vui lòng đăng nhập để truy cập cài đặt
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1}>Cài đặt</Title>
          <Text c="dimmed" size="sm">
            Quản lý thông tin tài khoản, quyền riêng tư và thông báo
          </Text>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconLock size={14} />}>
              Hồ sơ
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<IconBell size={14} />}>
              Thông báo
            </Tabs.Tab>
            <Tabs.Tab value="privacy" leftSection={<IconEye size={14} />}>
              Quyền riêng tư
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconShield size={14} />}>
              Bảo mật
            </Tabs.Tab>
          </Tabs.List>

          {/* Profile Tab */}
          <Tabs.Panel value="profile" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Title order={2}>Thông tin hồ sơ</Title>
                  <Text size="sm" c="dimmed">
                    Cập nhật thông tin cá nhân của bạn
                  </Text>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        label="Họ"
                        placeholder="Nhập họ của bạn"
                        {...profileForm.getInputProps('firstName')}
                      />
                      <TextInput
                        label="Tên"
                        placeholder="Nhập tên của bạn"
                        {...profileForm.getInputProps('lastName')}
                      />
                    </SimpleGrid>

                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      disabled
                      {...profileForm.getInputProps('email')}
                      description="Email không thể thay đổi"
                    />

                    <Group justify="flex-end">
                      <Button variant="light" onClick={() => profileForm.reset()}>
                        Hủy
                      </Button>
                      <Button type="submit" loading={isPending}>
                        Lưu thay đổi
                      </Button>
                    </Group>
                  </Stack>
                </form>

                <Divider />

                {/* API Key Section */}
                <div>
                  <Title order={3}>Khoá API</Title>
                  <Text size="sm" c="dimmed" mb="md">
                    Sử dụng khoá API này để tích hợp với các ứng dụng bên thứ ba
                  </Text>
                  <Card p="sm" withBorder bg="gray.0">
                    <Group justify="space-between">
                      <Text size="sm" style={{ wordBreak: 'break-all' }}>
                        sk_live_abc123def456ghi789jkl
                      </Text>
                      <CopyButton value="sk_live_abc123def456ghi789jkl">
                        {({ copied }) => (
                          <Tooltip label={copied ? 'Đã sao chép' : 'Sao chép'} withArrow position="left">
                            <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle">
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Card>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Notifications Tab */}
          <Tabs.Panel value="notifications" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Title order={2}>Tùy chọn thông báo</Title>
                  <Text size="sm" c="dimmed">
                    Chọn cách bạn muốn nhận thông báo
                  </Text>
                </div>

                <Stack gap="md">
                  <Switch
                    label="Bật thông báo qua email"
                    description="Nhận thông báo qua email khi có sự kiện quan trọng"
                    {...notificationForm.getInputProps('emailNotifications', { type: 'checkbox' })}
                  />

                  <Switch
                    label="Nhắc nhở về bài tập"
                    description="Nhận nhắc nhở khi gần đến hạn cuối cùng"
                    {...notificationForm.getInputProps('assignmentReminders', { type: 'checkbox' })}
                  />

                  <Switch
                    label="Báo cáo hàng tuần"
                    description="Nhận tóm tắt hoạt động hàng tuần qua email"
                    {...notificationForm.getInputProps('weeklyDigest', { type: 'checkbox' })}
                  />

                  <Switch
                    label="Thông báo kỹ năng mới"
                    description="Thông báo khi bạn thêm kỹ năng mới"
                    {...notificationForm.getInputProps('newSkillAlerts', { type: 'checkbox' })}
                  />
                </Stack>

                <Group justify="flex-end">
                  <Button variant="light">Hủy</Button>
                  <Button onClick={handleNotificationSave}>Lưu thông báo</Button>
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Privacy Tab */}
          <Tabs.Panel value="privacy" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Title order={2}>Cài đặt quyền riêng tư</Title>
                  <Text size="sm" c="dimmed">
                    Kiểm soát quyền truy cập và chia sẻ dữ liệu
                  </Text>
                </div>

                <Stack gap="md">
                  <Select
                    label="Độ hiển thị hồ sơ"
                    placeholder="Chọn mức độ hiển thị"
                    data={[
                      { value: 'private', label: 'Riêng tư (chỉ admin)' },
                      { value: 'instructor', label: 'Giáo viên (giáo viên + admin)' },
                      { value: 'public', label: 'Công khai (mọi người)' },
                    ]}
                    {...privacyForm.getInputProps('profileVisibility')}
                  />

                  <Switch
                    label="Cho phép hợp tác"
                    description="Cho phép giáo viên xem và bình luận bài tập của bạn"
                    {...privacyForm.getInputProps('allowCollaboration', { type: 'checkbox' })}
                  />

                  <Switch
                    label="Chia sẻ thống kê"
                    description="Chia sẻ thống kê hiệu suất (ẩn danh) với nhóm giáo viên"
                    {...privacyForm.getInputProps('shareAnalytics', { type: 'checkbox' })}
                  />
                </Stack>

                <Group justify="flex-end">
                  <Button variant="light">Hủy</Button>
                  <Button onClick={handlePrivacySave}>Lưu quyền riêng tư</Button>
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Security Tab */}
          <Tabs.Panel value="security" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="lg">
                <div>
                  <Title order={2}>Bảo mật</Title>
                  <Text size="sm" c="dimmed">
                    Cập nhật mật khẩu và các cài đặt bảo mật khác
                  </Text>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <Stack gap="md">
                    <PasswordInput
                      label="Mật khẩu hiện tại"
                      placeholder="Nhập mật khẩu hiện tại"
                      {...passwordForm.getInputProps('currentPassword')}
                    />

                    <PasswordInput
                      label="Mật khẩu mới"
                      placeholder="Nhập mật khẩu mới"
                      {...passwordForm.getInputProps('newPassword')}
                    />

                    <PasswordInput
                      label="Xác nhận mật khẩu"
                      placeholder="Xác nhận mật khẩu mới"
                      {...passwordForm.getInputProps('confirmPassword')}
                    />

                    <Group justify="flex-end">
                      <Button variant="light" onClick={() => passwordForm.reset()}>
                        Hủy
                      </Button>
                      <Button type="submit">Đổi mật khẩu</Button>
                    </Group>
                  </Stack>
                </form>

                <Divider />

                <div>
                  <Title order={3}>Phiên đăng nhập</Title>
                  <Text size="sm" c="dimmed" mb="md">
                    Quản lý các thiết bị đang đăng nhập tài khoản của bạn
                  </Text>
                  <Card p="sm" withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Thiết bị hiện tại
                        </Text>
                        <Text size="xs" c="dimmed">
                          Windows • Chrome • Lần cuối 5 phút trước
                        </Text>
                      </Stack>
                      <Badge color="green">Đang hoạt động</Badge>
                    </Group>
                  </Card>
                </div>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
