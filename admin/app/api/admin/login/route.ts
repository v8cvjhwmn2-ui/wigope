import { NextRequest, NextResponse } from 'next/server';
import {
  adminCookieOptions,
  configuredAdminEmail,
  createAdminSession,
  hasAdminPassword,
  validateAdminCredentials,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; otp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { message: 'Invalid JSON body' } }, { status: 400 });
  }

  if (!hasAdminPassword()) {
    return NextResponse.json(
      { ok: false, error: { message: 'Admin auth is not configured on this deployment' } },
      { status: 503 },
    );
  }

  const otp = String(body.otp ?? '');
  if (!validateAdminCredentials(String(body.email ?? ''), String(body.password ?? ''), otp)) {
    return NextResponse.json({ ok: false, error: { message: 'Invalid admin credentials' } }, { status: 401 });
  }

  const token = createAdminSession(configuredAdminEmail());
  const res = NextResponse.json({ ok: true, data: { email: configuredAdminEmail(), role: 'super_admin' } });
  res.cookies.set({ ...adminCookieOptions(), value: token });
  return res;
}
