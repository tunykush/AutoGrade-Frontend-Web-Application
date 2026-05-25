import { NextResponse } from 'next/server'

function extractUpstreamError(data: Record<string, unknown>): string {
  if (data.error && typeof data.error === 'object') {
    const inner = data.error as Record<string, unknown>
    if (typeof inner.message === 'string') return inner.message
  }
  if (typeof data.message === 'string') return data.message
  if (typeof data.detail === 'string') return data.detail
  return 'Invalid credentials'
}

export async function POST(req: Request) {
  const { name, password } = await req.json()
  try {
    const res = await fetch('https://edgenai-api.azure-api.net/api/v2/token?username=' + name + '&password=' + password, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
      },
      body: JSON.stringify({ username: name, password }),
    })
    const data = await res.json()
    console.log('[signin] status:', res.status, 'response:', JSON.stringify(data))

    if (!res.ok || !data.access) {
      return NextResponse.json(
        { error: extractUpstreamError(data) },
        { status: res.ok ? 401 : res.status }
      )
    }

    const response = NextResponse.json({ access_token: data.access })
    response.cookies.set('access_token', data.access, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    response.cookies.set('is_logged_in', '1', {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: 'Signin failed' }, { status: 500 })
  }
}