import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';

export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get('access_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated. Please sign in.' }, { status: 401 });
        }
 
        const { searchParams } = new URL(req.url);
        const paperId = searchParams.get('paperId')?.trim();
 
        if (!paperId) {
            return NextResponse.json({ error: 'paperId is required' }, { status: 400 });
        }
 
        const url = `${EDGEN_BASE}/qh/${encodeURIComponent(paperId)}/qh_api_delete`;
 
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.EDGEN_SUBSCRIPTION_KEY ?? '',
            },
            cache: 'no-store',
        });

        if (res.status === 204) {
            return NextResponse.json({ success: true }, { status: 200 });
        }
 
        const text = await res.text();
        let data: any;
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { raw: text };
        }
 
        if (!res.ok) {
            return NextResponse.json(
                { error: 'Delete failed', status: res.status, detail: data },
                { status: res.status }
            );
        }
 
        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}