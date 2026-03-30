'use client'

import { useState } from 'react'
import { parseApiError } from '@/lib/api'
import ErrorBox from './ErrorBox'
import BackLink from './BackLink'

export default function RequestReset() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        setSubmitted(true)
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

  if (submitted) {
    return (
      <div className="pr-success">
        <div className="pr-success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="pr-success-title">Check your inbox</h2>
        <p className="pr-success-text">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </p>
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
      <h1 className="pr-title">Forgot password?</h1>
      <p className="pr-subtitle">No worries. Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="pr-form">
        <div className="pr-field">
          <label htmlFor="email" className="pr-label">Email address</label>
          <div className="pr-input-wrapper">
            <svg className="pr-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="email"
              type="email"
              className="pr-input"
              placeholder="you@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button type="submit" className="pr-button" disabled={loading}>
          {loading ? <span className="pr-spinner" /> : 'Send reset link'}
        </button>
      </form>

      <BackLink />
    </>
  )
}
