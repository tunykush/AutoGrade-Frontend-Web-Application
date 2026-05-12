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
  const { paper_id, canonical_question_id, rubric } = body ?? {};

  if (!paper_id) return NextResponse.json({ error: 'Missing paper_id' }, { status: 400 });

  // Build the rubric payload in the format the API expects
  const rubricKey = canonical_question_id ?? paper_id;
  const rubricPayload = {
    rubrics: {
      [rubricKey]: {
        performance_levels: rubric?.performance_levels ?? [],
        deductions: rubric?.deductions ?? [],
        editable: true,
        approved_by_user: true,
      },
    },
  };

  const res = await fetchRetry(
    `${BASE}/rh/${paper_id}/rh_api_update_rubric?token=${encodeURIComponent(token)}`,
    {
      method: 'PUT',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(rubricPayload),
    },
  );

  const data = await res.json().catch(() => null);
  console.log(`[rh/update] paper_id=${paper_id} status=${res.status} response:`, JSON.stringify(data));
  return NextResponse.json(data ?? {}, { status: res.ok ? 200 : res.status });
}