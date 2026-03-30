import { NextRequest, NextResponse } from 'next/server'

const UPSTREAM = 'https://edgenai-api.azure-api.net'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const response = await fetch(`${UPSTREAM}/api/v2/password-reset/confirm/`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.APIM_KEY!,
      'x-institute': 'RMIT',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  return new NextResponse(text, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
