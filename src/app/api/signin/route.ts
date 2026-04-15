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
    console.log('data :>> ', data);
    if (!data.access) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const response = NextResponse.json({ access_token: data.access })
    response.cookies.set('access_token', data.access, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json({ error: 'Signin failed' }, { status: 500 })
  }
}