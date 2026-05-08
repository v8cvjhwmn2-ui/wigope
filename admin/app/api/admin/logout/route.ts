import { NextResponse } from 'next/server';
import { adminCookieOptions } from '@/lib/admin-auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...adminCookieOptions(), value: '', maxAge: 0 });
  return res;
}
