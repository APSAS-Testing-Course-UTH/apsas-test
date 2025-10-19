import { VerifyEmailForm } from '../components/VerifyEmailForm'

// Page xác minh email - VerifyEmailForm đã bao gồm wrapper và styling
interface VerifyEmailPageProps {
  token?: string
}

export const VerifyEmailPage = ({ token }: VerifyEmailPageProps) => {
  return <VerifyEmailForm token={token} />
}