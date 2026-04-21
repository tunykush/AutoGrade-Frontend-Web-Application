import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';
 
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('access_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated. Please sign in.' }, { status: 401 });
        }
 
        const formData = await req.formData();
        const file = formData.get('file');
 
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
 
        const upstream = new FormData();
        upstream.append('file', file, file.name);
 
        const url = `${EDGEN_BASE}/qh/qh_api_upload_paper`;
 
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.EDGEN_SUBSCRIPTION_KEY ?? '',
            },
            body: upstream,
            cache: 'no-store',
        });
 
        const text = await res.text();
        
        let data: any;
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { raw: text };
        }
 
        if (!res.ok) {
            return NextResponse.json(
                { error: 'Upload failed', status: res.status, detail: data },
                { status: res.status }
            );
        }
 
        const paperId = data?.paper_id ?? data?.id ?? null;
 
        return NextResponse.json(
            { ...data, paper_id: paperId },
            { status: res.status }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}