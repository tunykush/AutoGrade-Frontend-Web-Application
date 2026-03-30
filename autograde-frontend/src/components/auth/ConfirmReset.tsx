'use client'

import { useState } from 'react'
import { parseApiError } from '@/lib/api'
import ErrorBox from './ErrorBox'
import BackLink from './BackLink'

export default function ConfirmReset({ resetToken }: { resetToken: string }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword) { setError('Please enter a new password.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      })
      if (response.ok) {
        setDone(true)
      } else {
        const text = await response.text()
        setError(parseApiError(response.status, text))
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="pr-success">
        <div className="pr-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="pr-success-title">Password updated</h2>
        <p className="pr-success-text">Your password has been reset successfully. You can now sign in.</p>
        <BackLink />
      </div>
    )
  }

  return (
    <>
      <div className="pr-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h1 className="pr-title">Set new password</h1>
      <p className="pr-subtitle">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="pr-form">
        <div className="pr-field">
          <label htmlFor="new-password" className="pr-label">New password</label>
          <div className="pr-input-wrapper">
            <svg className="pr-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="new-password"
              type="password"
              className="pr-input"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="pr-field">
          <label htmlFor="confirm-password" className="pr-label">Confirm password</label>
          <div className="pr-input-wrapper">
            <svg className="pr-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="confirm-password"
              type="password"
              className="pr-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button type="submit" className="pr-button" disabled={loading}>
          {loading ? <span className="pr-spinner" /> : 'Reset password'}
        </button>
      </form>

      <BackLink />
    </>
  )
}
