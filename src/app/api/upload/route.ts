import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';
const PAPER_ID = process.env.EDGEN_DEFAULT_PAPER_ID ?? '';
 
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('access_token')?.value; // for read the bearer token saved by signin
    if (!token) {
        return NextResponse.json({ error: 'Not authenticated. Please sign in.' }, { status: 401 });
    }
    if (!PAPER_ID) {
      return NextResponse.json({ error: 'EDGEN_DEFAULT_PAPER_ID is not set.' }, { status: 500 });
    }
 
    const formData = await req.formData();
    const file = formData.get('file');
 
    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
 
    const upstream = new FormData();
    upstream.append('file', file, file.name);
    upstream.append('exam_id', '1');
 
    const url = new URL(`${EDGEN_BASE}/ag/paper/${encodeURIComponent(PAPER_ID)}/ag_api_upload_n_grade`);
 
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
        },
        body: upstream,
        cache: 'no-store',
    });
 
    const text = await res.text();
    let data: any;
    try {
        data = text ? JSON.parse(text) : {};
    } 
    catch {
        data = { raw: text };
    }
    if (!res.ok) {
        return NextResponse.json(
            { error: 'Upload failed', status: res.status, detail: data },
            { status: res.status }
        );
    }
 
    const submissionId = data?.submission_id ?? data?.Assignment_id ?? null;
 
    return NextResponse.json(
        { ...data, submission_id: submissionId, paper_id: PAPER_ID },
        { status: res.status }
    );
    } 
    catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}