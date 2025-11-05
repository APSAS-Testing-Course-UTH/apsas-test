import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { TextInput, PasswordInput, Button, Checkbox, Text, Title, Anchor, Paper, Stack } from '@mantine/core'
import { Link } from '@tanstack/react-router'

import { useLogin } from '../hooks/useLogin'
import { loginSchema } from '../schemas/loginSchema'

// Component form đăng nhập
interface LoginFormProps {
  redirectTo?: string
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
  // Khởi tạo form với zod4Resolver và loginSchema
  const form = useForm({
    validate: zod4Resolver(loginSchema),
    initialValues: {
      email: '',
      password: ''
    }
  })

  // Sử dụng hook useLogin để handle logic đăng nhập
  const loginMutation = useLogin({ redirectTo })

  // Hàm xử lý submit form
  const handleSubmit = (values: typeof form.values) => {
    loginMutation.mutate({ body: values })
  }

  return (
    <div style={{ width: "100%", height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }}>
      <Paper withBorder shadow="md" radius="md" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '30px', width: '100%' }}>
          <Stack align="center" mb="lg">
            <Title ta="center" size="h2">
              Đăng nhập vào APSAS
            </Title>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Email"
              placeholder="Nhập email của bạn"
              size="md"
              radius="md"
              mb="md"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              size="md"
              radius="md"
              mb="xl"
              {...form.getInputProps('password')}
            />

            <Checkbox
              label="Ghi nhớ đăng nhập"
              size="md"
              mb="xl"
            />

            <Button
              fullWidth
              size="md"
              radius="md"
              mb="md"
              type="submit"
              loading={loginMutation.isPending}
            >
              Đăng nhập
            </Button>

            <Anchor
              component={Link}
              to="/forgot-password"
              ta="center"
              display="block"
              fw={500}
              mb="md"
            >
              Quên mật khẩu?
            </Anchor>

            <Text ta="center">
              Chưa có tài khoản?{' '}
              <Anchor
                component={Link}
                to="/register"
                fw={500}
              >
                Đăng ký
              </Anchor>
            </Text>
          </form>
        </div>
      </Paper>
    </div>
  )
}