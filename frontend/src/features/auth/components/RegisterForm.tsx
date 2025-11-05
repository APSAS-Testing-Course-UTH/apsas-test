import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { TextInput, PasswordInput, Button, Group, Anchor, Checkbox, Title, Paper, Container, Text } from '@mantine/core'
import { Link } from '@tanstack/react-router'

import { useRegister } from '../hooks/useRegister'
import { registerSchema } from '../schemas/registerSchema'

// Component form đăng ký với Mantine UI
export const RegisterForm = () => {
  // Khởi tạo form với zod4Resolver và registerSchema
  const form = useForm({
    validate: zod4Resolver(registerSchema),
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false
    }
  })

  // Sử dụng hook useRegister để handle logic đăng ký
  const registerMutation = useRegister()

  // Hàm xử lý submit form
  const handleSubmit = (values: typeof form.values) => {
    // Schema đã tự động thêm role: STUDENT qua .transform()
    registerMutation.mutate({ body: values })
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title ta="center" size="h2" mb="lg">
          Tạo tài khoản Sinh viên APSAS
        </Title>

        {/* Thông báo chỉ dành cho sinh viên */}
        <Paper withBorder p="sm" mb="md" bg="blue.0">
          <Text size="sm" c="blue.7" ta="center">
            Đăng ký tài khoản dành cho Sinh viên. Sau khi đăng ký, bạn sẽ được chuyển hướng đến trang dành cho Sinh viên.
          </Text>
        </Paper>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          {/* Input họ và tên */}
          <Group grow mb="md">
            <TextInput
              label="Họ"
              placeholder="Nguyễn"
              size="md"
              radius="md"
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label="Tên"
              placeholder="Văn A"
              size="md"
              radius="md"
              {...form.getInputProps('lastName')}
            />
          </Group>

          {/* Input email */}
          <TextInput
            label="Email"
            placeholder="hello@gmail.com"
            size="md"
            radius="md"
            mb="md"
            {...form.getInputProps('email')}
          />

          {/* Input mật khẩu */}
          <PasswordInput
            label="Mật khẩu"
            placeholder="Tối thiểu 8 ký tự"
            size="md"
            radius="md"
            mb="md"
            {...form.getInputProps('password')}
          />

          {/* Input xác nhận mật khẩu */}
          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            size="md"
            radius="md"
            mb="md"
            {...form.getInputProps('confirmPassword')}
          />

          {/* Checkbox đồng ý điều khoản */}
          <Checkbox
            label="Tôi đồng ý với điều khoản sử dụng"
            size="md"
            mb="xl"
            {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
          />

          {/* Nút đăng ký với loading state */}
          <Button
            fullWidth
            size="md"
            radius="md"
            mb="md"
            type="submit"
            loading={registerMutation.isPending}
          >
            Tạo tài khoản
          </Button>

          {/* Link quay lại đăng nhập */}
          <Anchor
            component={Link}
            to="/login"
            ta="center"
            display="block"
            fw={500}
          >
            Đã có tài khoản? Đăng nhập
          </Anchor>
        </form>
      </Paper>
    </Container>
  )
}