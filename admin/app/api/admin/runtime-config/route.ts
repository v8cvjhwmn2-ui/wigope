import { NextRequest, NextResponse } from 'next/server';
import { readAdminSession } from '@/lib/admin-auth';

const backendBase = process.env.BACKEND_API_BASE_URL ?? 'https://recharge-api.wigope.com/api/v1';
const adminSecret = process.env.ADMIN_PANEL_SECRET ?? '';

export async function GET(req: NextRequest) {
  return forward('/admin/runtime-config', { method: 'GET' }, req);
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  return forward('/admin/runtime-config', { method: 'PUT', body }, req);
}

async function forward(path: string, init: RequestInit, req: NextRequest) {
  if (!readAdminSession(req)) {
    return NextResponse.json({ ok: false, error: { message: 'Unauthenticated' } }, { status: 401 });
  }
  try {
    const res = await fetch(`${backendBase}${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    return new NextResponse(text || '{}', {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return NextResponse.json({ ok: false, error: { message: 'Recharge API is not reachable' } }, { status: 502 });
  }
}
