import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const incomingForm = await req.formData();
  const file = incomingForm.get('file');
  const paperId = incomingForm.get('paper_id');
  const examId = incomingForm.get('exam_id');

  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  if (!paperId) return NextResponse.json({ error: 'Missing paper_id' }, { status: 400 });

  const formData = new FormData();
  formData.append('file', file);
  if (typeof examId === 'string') formData.append('exam_id', examId);

  const res = await fetchRetry(
    `${BASE}/ag/paper/${paperId}/ag_api_upload_n_grade?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
      },
      body: formData,
    },
  );

  const data = await res.json().catch(() => null);
  console.log(`[ag/upload-grade] paper_id=${paperId} status=${res.status} response:`, JSON.stringify(data));
  return NextResponse.json(data ?? { error: 'Upload failed' }, { status: res.ok ? 200 : res.status });
}
