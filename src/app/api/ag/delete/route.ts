import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(req: NextRequest) {
  const submissionId = req.nextUrl.searchParams.get('submissionId')
  if (!submissionId) return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://edgenai-api.azure-api.net/api/v2/ag/submission/${submissionId}/ag_api_delete_submission`,
      { method: 'DELETE', headers }
    )
    if (res.status === 200) {
      return NextResponse.json({ success: true }, { status: 200 })
    }
    const text = await res.text()
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return NextResponse.json({ error: text }, { status: res.status })
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}