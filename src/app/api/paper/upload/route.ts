import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token =
    cookieStore.get('access_token')?.value ??
    req.headers.get('X-Auth-Token') ??
    undefined

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()

  const res = await fetch(
    'https://edgenai-api.azure-api.net/api/v2/qh/qh_api_upload_paper',
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_KEY!,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  )

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
