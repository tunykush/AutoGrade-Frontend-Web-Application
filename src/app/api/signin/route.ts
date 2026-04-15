import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { username, password } = await req.json()
  console.log(username, password);
  try {
    const res = await fetch('https://edgenai-api.azure-api.net/api/v2/token?username=' + username + '&password=' + password, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.APIM_KEY!,
       },

      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    console.log('signin response status:', res.status, 'body:', JSON.stringify(data))

    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid credentials', detail: data }, { status: 401 })
    }

    const accessToken = data.access ?? data.access_token ?? data.token
    if (!accessToken) {
      return NextResponse.json({ error: 'No token in response', detail: data }, { status: 401 })
    }

    const response = NextResponse.json({ access_token: accessToken })
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: 'Signin failed' }, { status: 500 })
  }
}