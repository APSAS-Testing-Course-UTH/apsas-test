import { useEffect, useState } from 'react'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { TextInput, Button, Title, Paper, Alert, Loader, Center, Container, Stack } from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'

import { useVerifyEmail } from '../hooks/useVerifyEmail'
import { verifyEmailSchema } from '../schemas/verifyEmailSchema'

// Component form xác minh email với Mantine UI
interface VerifyEmailFormProps {
  token?: string
}

export const VerifyEmailForm = ({ token }: VerifyEmailFormProps) => {
  // State để track trạng thái xác minh
  const [isAutoVerifying, setIsAutoVerifying] = useState(false)

  // Lấy navigate hook
  const navigate = useNavigate()

  // Khởi tạo form với zodResolver và verifyEmailSchema
  const form = useForm({
    validate: zodResolver(verifyEmailSchema),
    initialValues: {
      token: token || ''
    }
  })

  // Sử dụng hook useVerifyEmail để handle logic xác minh
  const verifyEmailMutation = useVerifyEmail()

  // Auto-verify khi component mount nếu có token
  useEffect(() => {
    if (token && !isAutoVerifying) {
      setIsAutoVerifying(true)
      form.setFieldValue('token', token)
      // Auto-submit form
      verifyEmailMutation.mutate({ body: { token } })
    }
  }, [token, form, verifyEmailMutation, isAutoVerifying])

  // Hàm xử lý submit form manual
  const handleSubmit = (values: typeof form.values) => {
    verifyEmailMutation.mutate({ body: values })
  }

  // Hiển thị loading khi đang auto-verify
  if (isAutoVerifying && verifyEmailMutation.isPending) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder shadow="md" p={30} radius="md">
          <Center>
            <Stack align="center">
              <Loader size="lg" />
              <Alert color="blue" title="Đang xác minh email">
                Đang tự động xác minh email của bạn...
              </Alert>
            </Stack>
          </Center>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" mb="lg">
          <Title ta="center" size="h2">
            Xác minh email
          </Title>
          <Title ta="center" size="h4" c="dimmed" fw={400}>
            Vui lòng xác minh email để hoàn tất đăng ký
          </Title>
        </Stack>

        {/* Hiển thị token nếu có */}
        {token && (
          <Alert color="blue" title="Token đã được tự động điền" mb="md">
            Token xác minh email đã được lấy từ URL.
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Token xác minh"
            placeholder="Nhập token xác minh email"
            size="md"
            radius="md"
            mb="xl"
            {...form.getInputProps('token')}
          />

          <Button
            fullWidth
            size="md"
            radius="md"
            mb="md"
            type="submit"
            loading={verifyEmailMutation.isPending}
          >
            Xác minh email
          </Button>
        </form>

        {/* Hiển thị lỗi nếu có */}
        {verifyEmailMutation.isError && (
          <Alert color="red" title="Lỗi">
            {verifyEmailMutation.error?.message || 'Có lỗi xảy ra khi xác minh email'}
          </Alert>
        )}

        {/* Hiển thị thành công nếu có */}
        {verifyEmailMutation.isSuccess && (
          <Alert color="green" title="Thành công" mb="md">
            Email đã được xác minh thành công! Bạn có thể đăng nhập ngay bây giờ.
          </Alert>
        )}

        {verifyEmailMutation.isSuccess && (
          <Button
            variant="light"
            fullWidth
            size="md"
            radius="md"
            onClick={() => navigate({ to: '/login', search: { redirect: '/' } })}
          >
            Đăng nhập
          </Button>
        )}
      </Paper>
    </Container>
  )
}