import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const { submissionId } = await req.json()

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://edgenai-api.azure-api.net/api/v2/ag/submission/${submissionId}/ag_api_finalize_submission`,
      { method: 'POST', headers }
    )
    const text = await res.text()
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: res.status })
    } catch {
      return NextResponse.json({ error: text }, { status: res.status })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}