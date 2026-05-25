import { NextResponse } from 'next/server'

function extractUpstreamError(data: Record<string, unknown>): string {
  // Handle nested { error: { message: "..." } } shape
  if (data.error && typeof data.error === 'object') {
    const inner = data.error as Record<string, unknown>
    if (typeof inner.message === 'string') return inner.message
  }
  if (typeof data.message === 'string') return data.message
  if (typeof data.detail === 'string') return data.detail

  const fieldMessages: string[] = []
  for (const key of ['email', 'username', 'password', 'non_field_errors']) {
    const val = data[key]
    if (Array.isArray(val) && val.length > 0) {
      fieldMessages.push(...val.map(String))
    } else if (typeof val === 'string') {
      fieldMessages.push(val)
    }
  }
  if (fieldMessages.length > 0) return fieldMessages.join(' ')

  return 'Signup failed'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    const res = await fetch('https://edgenai-api.azure-api.net/api/v2/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
      },
      body: JSON.stringify({
        username: name,
        email,
        password,
        institution: 'Demo College',
        phone: '',
        recaptcha: 'dummy-token',
      }),
    })

    const data = await res.json().catch(() => ({}))
    console.log('[signup] status:', res.status, 'response:', JSON.stringify(data))

    if (!res.ok) {
      return NextResponse.json(
        { error: extractUpstreamError(data) },
        { status: res.status }
      )
    }

    const response = NextResponse.json({
      message: 'Signup successful',
      username: data.username,
    })
    response.cookies.set('auth_user', data.username, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    )
  }
}