import { Stack, Title, Button, Group, Alert } from '@mantine/core';
import { IconLock, IconInfoCircle } from '@tabler/icons-react';

interface AccountSettingsSectionProps {
  onChangePassword: () => void;
}

/**
 * AccountSettingsSection Component
 * 
 * Vietnamese: "Cài đặt bảo mật"
 * 
 * Displays password management options.
 * Scope: Only what backend Identity Service API provides
 * - Change password: POST /api/v1/users/me/change-password
 */
export function AccountSettingsSection({ onChangePassword }: AccountSettingsSectionProps) {
  return (
    <Stack gap="md">
      <Title order={2} size="h3">
        Bảo mật
      </Title>

      <Alert icon={<IconInfoCircle size={16} />} title="Thông tin bảo mật" color="blue">
        Thay đổi mật khẩu của bạn thường xuyên để bảo vệ tài khoản
      </Alert>

      <Group justify="space-between" align="center" p="md" style={{ borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <Stack gap="xs">
          <Title order={3} size="h5">
            Đổi mật khẩu
          </Title>
          <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
            Cập nhật mật khẩu của bạn để tăng cường bảo mật
          </p>
        </Stack>
        <Button
          leftSection={<IconLock size={16} />}
          onClick={onChangePassword}
          variant="light"
          color="orange"
        >
          Đổi mật khẩu
        </Button>
      </Group>
    </Stack>
  );
}
