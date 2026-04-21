import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const paperId = req.nextUrl.searchParams.get('paperId')
  if (!paperId) return NextResponse.json({ error: 'Missing paperId' }, { status: 400 })

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  try {
    const res = await fetch(
      `https://edgenai-api.azure-api.net/api/v2/ag/paper/${paperId}/submission/ag_api_list_submission`,
      { headers, cache: 'no-store' }
    )
    const text = await res.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}