import { NextRequest, NextResponse } from 'next/server';
 
const EDGEN_BASE = process.env.EDGEN_BASE_URL ?? 'https://edgenai-api.azure-api.net/api/v2';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('access_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated. Please sign in.' }, { status: 401 });
        }
 
        const url = `${EDGEN_BASE}/qh/list_papers`;
 
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
            },
            cache: 'no-store',
        });
 
        const text = await res.text();
        let data: any;
        try {
            data = text ? JSON.parse(text) : [];
        } catch {
            data = { raw: text };
        }
 
        if (!res.ok) {
            return NextResponse.json(
                { error: 'Failed to list papers', status: res.status, detail: data },
                { status: res.status }
            );
        }
 
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error', detail: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}