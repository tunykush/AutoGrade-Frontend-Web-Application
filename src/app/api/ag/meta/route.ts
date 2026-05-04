import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const { paperId, submissionId, student_id } = await req.json()

  if (!paperId || !submissionId || !student_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://edgenai-api.azure-api.net/api/v2/ag/paper/${paperId}/submission/${submissionId}/ag_api_update_submission_meta`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ student_id }),
      }
    )
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