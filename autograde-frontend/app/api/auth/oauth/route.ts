import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') || 'google';
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/oauth/callback`;
  const apiKey = process.env.EDAI_API_KEY || '';

  // Try the authorize-url endpoint first
  const res = await fetch(
    `https://edgenai-api.azure-api.net/api/v2/oauth/authorize-url?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    }
  );

  const data = await res.json();
  console.log('OAuth status:', res.status);
  console.log('OAuth full response:', JSON.stringify(data));

  return NextResponse.json(data, { status: res.status });
}
