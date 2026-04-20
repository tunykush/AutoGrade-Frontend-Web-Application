import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value;
      if (!token) {
        return NextResponse.json({ error: 'Not authenticated. Please sign in.' }, { status: 401 });
      }
  
    const { searchParams } = new URL(req.url);
    const submissionId = String(searchParams.get('submissionId') ?? '').trim();
  
      if (!submissionId) {
        return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
      }
  
    const url = new URL(`${EDGEN_BASE}/ag/paper/${encodeURIComponent(submissionId)}/ag_api_status`);
  
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
    };
  
    const TERMINAL = new Set(['SUCCESS', 'FINALIZED', 'FAILED', 'TIMEOUT']);
    const STATUS_MAP: Record<string, string> = {
      READY: 'SUCCESS', COMPLETED: 'SUCCESS', COMPLETE: 'SUCCESS', DONE: 'SUCCESS',
      ERROR: 'FAILED', FAILURE: 'FAILED',
      IN_PROGRESS: 'RUNNING', PROCESSING: 'RUNNING', QUEUED: 'RUNNING', STARTED: 'RUNNING',
    };
  
    let data: any = {};
    let attempts = 0;
    const MAX_ATTEMPTS = 30;
  
    while (attempts < MAX_ATTEMPTS) {
      const res = await fetch(url.toString(), { method: 'GET', headers, cache: 'no-store' });
      const text = await res.text();
  
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }
  
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Status check failed', status: res.status, detail: data },
          { status: res.status }
        );
      }
  
      const raw = (data?.validation_status ?? data?.status ?? '').toUpperCase();
      const normalised = STATUS_MAP[raw] ?? raw;
      data.validation_status = normalised;
  
      if (TERMINAL.has(normalised)) break;
  
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;
    }
  
    return NextResponse.json(data);

  } 
    catch (error) {
      return NextResponse.json(
        { error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown' },
        { status: 500 }
      );
    }
}