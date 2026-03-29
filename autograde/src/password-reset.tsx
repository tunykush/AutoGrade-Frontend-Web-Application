import React, { useState } from 'react'
import './password-reset.css'

const BASE_URL = ""
const HEADERS = {
  "Ocp-Apim-Subscription-Key": import.meta.env.VITE_APIM_KEY,
  "x-institute": "RMIT",
  "Content-Type": "application/json"
}

const token = new URLSearchParams(window.location.search).get('token')



function BrandPanel() {
  return (
    <div className="pr-left">
      <div className="pr-logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L24 9.5V18.5L14 26L4 18.5V9.5L14 2Z" fill="rgba(255,255,255,0.9)"/>
          <path d="M14 7L20 11.5V16.5L14 21L8 16.5V11.5L14 7Z" fill="rgba(255,255,255,0.4)"/>
        </svg>
        EdGenAI
      </div>
      <div className="pr-left-tagline">
        <h2>Empowering Education with Generative AI</h2>
        <p>Reset your password to get back to your institution's AI-powered tools.</p>
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="pr-error">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </div>
  )
}

function BackLink() {
  return (
    <a href="/" className="pr-back-link">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Back to login
    </a>
  )
}



function RequestReset() {
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
      const response = await fetch(`${BASE_URL}/api/v2/password-reset/`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ email })
      })
      if (response.ok) {
        setSubmitted(true)
      } else {
        const text = await response.text()
        console.error('Password reset error', response.status, text)
        try {
          const data = JSON.parse(text)
          const detail = data?.detail
          const msg = Array.isArray(detail)
            ? detail.map((d: { msg: string }) => d.msg).join(', ')
            : detail || `Error ${response.status}`
          setError(msg)
        } catch {
          setError(`Error ${response.status}: ${text || 'Something went wrong.'}`)
        }
      }
    } catch (err) {
      console.error('Network error', err)
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

/* ── Step 2: Confirm reset ────────────────────────────── */

function ConfirmReset({ resetToken }: { resetToken: string }) {
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
      const response = await fetch(`${BASE_URL}/api/v2/password-reset/confirm/`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ token: resetToken, new_password: newPassword })
      })
      if (response.ok) {
        setDone(true)
      } else {
        const text = await response.text()
        console.error('Password reset confirm error', response.status, text)
        try {
          const data = JSON.parse(text)
          const detail = data?.detail
          const msg = Array.isArray(detail)
            ? detail.map((d: { msg: string }) => d.msg).join(', ')
            : detail || `Error ${response.status}`
          setError(msg)
        } catch {
          setError(`Error ${response.status}: ${text || 'Something went wrong.'}`)
        }
      }
    } catch (err) {
      console.error('Network error', err)
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



function PasswordReset() {
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

export default PasswordReset