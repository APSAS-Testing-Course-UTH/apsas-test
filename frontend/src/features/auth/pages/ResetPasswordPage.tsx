import { ResetPasswordForm } from '../components/ResetPasswordForm'

// Page đặt lại mật khẩu - ResetPasswordForm đã bao gồm wrapper và styling
interface ResetPasswordPageProps {
  token?: string
}

export const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  return <ResetPasswordForm token={token} />
}