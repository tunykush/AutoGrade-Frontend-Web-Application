import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(
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

  const res = await fetch(
    `https://edgenai-api.azure-api.net/api/v2/rh/${paper_id}/rh_api_status`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
