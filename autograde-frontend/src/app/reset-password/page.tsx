import { Suspense } from 'react'
import PasswordResetView from '@/components/auth/PasswordResetView'

export const metadata = {
  title: 'EdGenAI – Reset Password',
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordResetView />
    </Suspense>
  )
}
