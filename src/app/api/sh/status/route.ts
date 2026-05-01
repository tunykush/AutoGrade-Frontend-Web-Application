import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const paperId = request.nextUrl.searchParams.get('paper_id');
  if (!paperId) return NextResponse.json({ error: 'Missing paper_id' }, { status: 400 });

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Try multiple candidate endpoint names — backend uses sh_api_ prefix convention
  const candidates = [
    'sh_api_status',
    'sh_api_get_status',
    'status',
  ];

  let res: Response | null = null;
  let usedEndpoint = '';
  for (const fn of candidates) {
    const r = await fetchRetry(
      `${BASE}/sh/${paperId}/${fn}?token=${encodeURIComponent(token)}`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
      1,
      false,
    );
    if (r.status !== 404) { res = r; usedEndpoint = fn; break; }
  }

  if (!res) {
    return NextResponse.json({ error: 'Sample answer status endpoint not found' }, { status: 404 });
  }

  const data = await res.json().catch(() => null);
  console.log(`[sh/status] endpoint=${usedEndpoint} paper_id=${paperId} status=${res.status}`, JSON.stringify(data));
  return NextResponse.json(data ?? {}, { status: res.ok ? 200 : res.status });
}
