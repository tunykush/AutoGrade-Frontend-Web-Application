import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('access_token', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  response.cookies.set('is_logged_in', '', { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}