import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, password } = await req.json()
  console.log('Signing in:', name)

  try {
    const res = await fetch('https://edgenai-api.azure-api.net/api/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
      },
      body: JSON.stringify({ username: name, password }),
    })

    const data = await res.json()
    console.log('Login response status:', res.status)

    if (!data.access) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      username: data.username || name,
    })

    // this saves access token
    response.cookies.set('access_token', data.access, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false, // must be false for localhost
    })

    // this saves if the token is refreshed
    if (data.refresh) {
      response.cookies.set('refresh_token', data.refresh, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      })
    }

    response.cookies.set('auth_username', data.username || name, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      secure: false,
    })

    return response
  } catch (err) {
    console.error('Signin error:', err)
    return NextResponse.json({ error: 'Signin failed' }, { status: 500 })
  }
}