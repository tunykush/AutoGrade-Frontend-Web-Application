import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const formData = await req.formData()
  const paperId = formData.get('paperId')

  const apiForm = new FormData()
  formData.forEach((value, key) => {
    if (key !== 'paperId') apiForm.append(key, value)
  })

  const headers: Record<string, string> = {
    'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY!,
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(
      `https://edgenai-api.azure-api.net/api/v2/ag/paper/${paperId}/ag_api_upload_n_grade`,
      { method: 'POST', headers, body: apiForm }
    )

    const data = await res.json()

    // 409 means file already exists — treat as success
    if (res.status === 409) {
      return NextResponse.json({
        submission_id: data.submission_id || data.Assignment_id,
        validation_status: data.validation_status || 'SUCCESS',
        status: 'EXISTS_SAME_FILE',
      }, { status: 200 })
    }

    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}