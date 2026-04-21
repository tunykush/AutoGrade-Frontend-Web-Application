import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const { paperId, submissionId, overrides } = await req.json()

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(
    `https://edgenai-api.azure-api.net/api/v2/ag/paper/${paperId}/submission/${submissionId}/ag_api_apply_review`,
    { method: 'PATCH', headers, body: JSON.stringify({ overrides }) }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}