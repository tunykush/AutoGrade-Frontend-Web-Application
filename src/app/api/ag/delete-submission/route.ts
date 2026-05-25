import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  const submissionId = request.nextUrl.searchParams.get('submission_id');
  if (!submissionId) return NextResponse.json({ error: 'Missing submission_id' }, { status: 400 });

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetchRetry(
    `${BASE}/ag/submission/${submissionId}/ag_api_delete_submission?token=${encodeURIComponent(token)}`,
    {
      method: 'DELETE',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
        Accept: 'application/json',
      },
    },
  );

  const data = await res.json().catch(() => null);
  console.log(`[ag/delete-submission] submission_id=${submissionId} status=${res.status}`);
  return NextResponse.json(data ?? {}, { status: res.ok ? 200 : res.status });
}