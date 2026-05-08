import { NextRequest, NextResponse } from 'next/server';
import { readAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const session = readAdminSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthenticated' } }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: session });
}
