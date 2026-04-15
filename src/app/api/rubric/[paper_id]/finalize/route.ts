import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ paper_id: string }> }
) {
  const { paper_id } = await params
  const cookieStore = await cookies()
  const token =
    cookieStore.get('access_token')?.value ??
    req.headers.get('X-Auth-Token') ??
    undefined

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))

  const res = await fetch(
    `https://edgenai-api.azure-api.net/api/v2/rh/${paper_id}/rh_api_finalize_rubric`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_KEY!,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
