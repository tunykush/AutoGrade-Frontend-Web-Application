'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AuthLayout from '@/components/auth/authlayout'
import AuthInput from '@/components/auth/authinput'
import AuthButton from '@/components/auth/authbutton'

function getPasswordErrors(pw: string): string[] {
  const errors: string[] = []
  if (pw.length < 8)              errors.push('At least 8 characters')
  if (!/[A-Z]/.test(pw))          errors.push('At least one uppercase letter')
  if (!/[a-z]/.test(pw))          errors.push('At least one lowercase letter')
  if (!/[0-9]/.test(pw))          errors.push('At least one number')
  if (!/[^A-Za-z0-9]/.test(pw))   errors.push('At least one special character')
  return errors
}

function PasswordStrengthBar({ password }: { password: string }) {
  const errors = getPasswordErrors(password)
  const score = 5 - errors.length // 0–5
  const pct = (score / 5) * 100
  const color =
    score <= 1 ? '#ef4444' :
    score <= 2 ? '#f97316' :
    score <= 3 ? '#eab308' :
    score <= 4 ? '#84cc16' :
                 '#22c55e'
  const label =
    score <= 1 ? 'Very weak' :
    score <= 2 ? 'Weak' :
    score <= 3 ? 'Fair' :
    score <= 4 ? 'Good' :
                 'Strong'

  if (!password) return null

  return (
    <div className="mb-4 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#7b7f8f]">Password strength</span>
        <span className="font-medium" style={{ color }}>{label}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {errors.length > 0 && (
        <ul className="space-y-0.5 pt-0.5">
          {errors.map((err) => (
            <li key={err} className="flex items-center gap-1.5 text-xs text-[#7b7f8f]">
              <span className="text-red-400">✗</span> {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (document.cookie.includes('is_logged_in')) {
      router.replace('/account');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const pwErrors = getPasswordErrors(password)
    if (pwErrors.length > 0) {
      setError('Please fix the password issues before continuing.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || data.message || data.detail || 'Signup failed')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Welcome! Please fill in the details to get started."
    >
    
      <form onSubmit={handleSubmit} autoComplete="on">
        <AuthInput
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="username"
        />

        <AuthInput
          label="Email address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <PasswordStrengthBar password={password} />

        {error ? (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        ) : null}

        <AuthButton type="submit">
          {loading ? 'Creating account...' : 'Continue'}
        </AuthButton>

        <p className="mt-8 text-center text-[15px] text-[#7b7f8f]">
          Already have an account?{' '}
          <Link href="/signin" className="font-medium text-[#3b3f4a] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}