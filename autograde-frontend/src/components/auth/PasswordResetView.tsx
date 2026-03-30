'use client'

import { useSearchParams } from 'next/navigation'
import BrandPanel from './BrandPanel'
import RequestReset from './RequestReset'
import ConfirmReset from './ConfirmReset'

export default function PasswordResetView() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="pr-container">
      <BrandPanel />
      <div className="pr-right">
        <div className="pr-card">
          {token ? <ConfirmReset resetToken={token} /> : <RequestReset />}
        </div>
      </div>
    </div>
  )
}
