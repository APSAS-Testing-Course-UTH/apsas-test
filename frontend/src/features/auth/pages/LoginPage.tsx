import { LoginForm } from '../components/LoginForm'
import classes from './LoginPage.module.css'

// Page đăng nhập với background và form tách biệt
// Updated layout for better mobile responsiveness
interface LoginPageProps {
  redirectTo?: string
}

export const LoginPage = ({ redirectTo }: LoginPageProps) => {
  return (
    <div className={classes.wrapper}>
      <div className={classes.formSection}>
        <LoginForm redirectTo={redirectTo} />
      </div>
      <div className={classes.backgroundSection}>
        {/* Background image container */}
      </div>
    </div>
  )
}