import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchRetry } from '@/lib/fetchRetry';

const BASE = 'https://edgenai-api.azure-api.net/api/v2';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { username } = body;
    if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

    console.log('[delete-account] attempting delete for username:', username);

    const res = await fetchRetry(
      `${BASE}/admin/users/delete_user?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.EDAI_API_KEY ?? '',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json().catch(() => null);
    console.log('[delete-account] backend status:', res.status, 'response:', JSON.stringify(data));

    if (res.ok) {
      const response = NextResponse.json(data ?? { success: true });
      response.cookies.set('access_token', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      response.cookies.set('is_logged_in', '', { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 0 });
      return response;
    }
    return NextResponse.json(data ?? {}, { status: res.status });
  } catch (err) {
    console.error('[delete-account] unhandled error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}