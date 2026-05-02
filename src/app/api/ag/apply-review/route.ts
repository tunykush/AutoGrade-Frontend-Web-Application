import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { paper_id, submission_id, overrides } = body ?? {};

  if (!paper_id) return NextResponse.json({ error: 'Missing paper_id' }, { status: 400 });
  if (!submission_id) return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });
  if (!overrides) return NextResponse.json({ error: 'Missing overrides' }, { status: 400 });

  const res = await fetchRetry(
    `${BASE}/ag/paper/${paper_id}/submission/${submission_id}/ag_api_apply_review?token=${encodeURIComponent(token)}`,
    {
      method: 'PATCH',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ overrides }),
    },
  );

  const data = await res.json().catch(() => null);
  console.log(`[ag/apply-review] paper_id=${paper_id} submission_id=${submission_id} status=${res.status} response:`, JSON.stringify(data));
  return NextResponse.json(data ?? {}, { status: res.ok ? 200 : res.status });
}