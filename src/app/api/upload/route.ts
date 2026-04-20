import { NextRequest, NextResponse } from 'next/server';

const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';
 
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
 
    const file = formData.get('file');
    const paperId = String(formData.get('paperId') ?? '').trim();
 
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
 
    if (!paperId) {
      return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
    }
 
    const upstream = new FormData();
    upstream.append('uploaded_file', file, file.name);
 
    const url = new URL(
      `${EDGEN_BASE}/ag/paper/${encodeURIComponent(paperId)}/ag_api_upload_n_grade`
    );
 
    const headers: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': process.env.EDGEN_SUBSCRIPTION_KEY ?? '',
    };
 
    if (process.env.EDGEN_INSTITUTE_ID) {
      headers['x_institute'] = process.env.EDGEN_INSTITUTE_ID;
    }
 
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: upstream,
      cache: 'no-store',
    });
 
    const text = await res.text();
 
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
 
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Edgen upload failed', status: res.status, detail: data },
        { status: res.status }
      );
    }
 
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}