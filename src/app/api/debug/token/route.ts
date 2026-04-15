import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// DEV ONLY — returns the current access token from the session cookie
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No token cookie found' }, { status: 404 })
  }

  return NextResponse.json({ token })
}
