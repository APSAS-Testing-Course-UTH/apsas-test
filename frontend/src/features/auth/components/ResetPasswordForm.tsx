import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { PasswordInput, Button, Title, Paper, Alert, Container, Stack } from '@mantine/core'

import { useResetPassword } from '../hooks/useResetPassword'
import { resetPasswordSchema } from '../schemas/resetPasswordSchema'

// Component form đặt lại mật khẩu với Mantine UI
interface ResetPasswordFormProps {
  token?: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  // Khởi tạo form với zod4Resolver và resetPasswordSchema
  const form = useForm({
    validate: zod4Resolver(resetPasswordSchema),
    initialValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Sử dụng hook useResetPassword để handle logic đặt lại mật khẩu
  const resetPasswordMutation = useResetPassword()

  // Auto-fill token khi component mount hoặc token thay đổi
  useEffect(() => {
    if (token) {
      form.setFieldValue('token', token)
    }
  }, [token, form])

  // Hàm xử lý submit form
  const handleSubmit = (values: typeof form.values) => {
    resetPasswordMutation.mutate({ body: values })
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" mb="lg">
          <Title ta="center" size="h2">
            Đặt lại mật khẩu
          </Title>
          <Title ta="center" size="h4" c="dimmed" fw={400}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Title>
        </Stack>

        {/* Hiển thị token nếu có */}
        {token && (
          <Alert color="blue" title="Token đã được tự động điền" mb="md">
            Token đặt lại mật khẩu đã được lấy từ URL.
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            size="md"
            radius="md"
            mb="md"
            {...form.getInputProps('newPassword')}
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            size="md"
            radius="md"
            mb="xl"
            {...form.getInputProps('confirmPassword')}
          />

          <Button
            fullWidth
            size="md"
            radius="md"
            mb="md"
            type="submit"
            loading={resetPasswordMutation.isPending}
          >
            Đặt lại mật khẩu
          </Button>
        </form>

        {/* Hiển thị lỗi nếu có */}
        {resetPasswordMutation.isError && (
          <Alert color="red" title="Lỗi">
            {resetPasswordMutation.error?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'}
          </Alert>
        )}

        {/* Hiển thị thành công nếu có */}
        {resetPasswordMutation.isSuccess && (
          <Alert color="green" title="Thành công">
            Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.
          </Alert>
        )}
      </Paper>
    </Container>
  )
}