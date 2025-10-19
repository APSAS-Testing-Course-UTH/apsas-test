import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Button, Anchor, Title, Paper, Container, Stack } from '@mantine/core'
import { Link } from '@tanstack/react-router'

import { useForgotPassword } from '../hooks/useForgotPassword'
import { forgotPasswordSchema } from '../schemas/forgotPasswordSchema'

// Component form quên mật khẩu với Mantine UI
export const ForgotPasswordForm = () => {
  // Khởi tạo form với zodResolver và forgotPasswordSchema
  const form = useForm({
    validate: zodResolver(forgotPasswordSchema),
    initialValues: {
      email: ''
    }
  })

  // Sử dụng hook useForgotPassword để handle logic gửi email reset
  const forgotPasswordMutation = useForgotPassword()

  // Hàm xử lý submit form
  const handleSubmit = (values: typeof form.values) => {
    forgotPasswordMutation.mutate({ body: values })
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" mb="lg">
          <Title ta="center" size="h2">
            Quên mật khẩu?
          </Title>
          <Title ta="center" size="h4" c="dimmed" fw={400}>
            Nhập email để nhận link đặt lại mật khẩu
          </Title>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="hello@gmail.com"
            description="Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này"
            size="md"
            radius="md"
            mb="xl"
            {...form.getInputProps('email')}
          />

          <Button
            fullWidth
            size="md"
            radius="md"
            mb="md"
            type="submit"
            loading={forgotPasswordMutation.isPending}
          >
            Gửi mã đặt lại mật khẩu
          </Button>

          <Anchor
            component={Link}
            to="/login"
            ta="center"
            display="block"
            fw={500}
          >
            Quay lại đăng nhập
          </Anchor>
        </form>
      </Paper>
    </Container>
  )
}