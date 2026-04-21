import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No token found in cookies' }, { status: 401 })
  }

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  try {
    const res = await fetch(
      'https://edgenai-api.azure-api.net/api/v2/qh/list_papers',
      { headers, cache: 'no-store' }
    )

    const text = await res.text()

    // Try to parse as JSON
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: res.status })
    } catch {
      // Return raw text if not JSON
      return new NextResponse(text, { status: res.status })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}