import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = decodeJwt(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  return NextResponse.json({
    id: (payload.user_id as string) ?? '',
    name: (payload.username as string) ?? 'User',
    email: (payload.email as string) ?? '',
    username: (payload.username as string) ?? '',
  });
}