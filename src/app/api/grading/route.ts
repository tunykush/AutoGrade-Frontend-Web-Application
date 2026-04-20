import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';
 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = String(searchParams.get('submissionId') ?? '').trim();
 
    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }
 
    const url = new URL(
      `${EDGEN_BASE}/ag/paper/${encodeURIComponent(submissionId)}/ag_api_get_grading_json`
    );
 
    const headers: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': process.env.EDGEN_SUBSCRIPTION_KEY ?? '',
    };
 
    if (process.env.EDGEN_INSTITUTE_ID) {
      headers['x_institute'] = process.env.EDGEN_INSTITUTE_ID;
    }
 
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers,
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
        { error: 'Edgen grading fetch failed', status: res.status, detail: data },
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