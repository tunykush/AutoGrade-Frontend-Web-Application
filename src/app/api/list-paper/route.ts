import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetchRetry(
    `${BASE}/qh/list_papers?token=${encodeURIComponent(token)}`,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
        Accept: 'application/json',
      },
    },
  );

  const data = await res.json().catch(() => null);
  console.log('[list-paper] status:', res.status, 'response:', JSON.stringify(data));
  return NextResponse.json(data ?? [], { status: res.ok ? 200 : res.status });
}