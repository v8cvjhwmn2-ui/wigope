import { NextRequest, NextResponse } from 'next/server';

const backendBase = process.env.BACKEND_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1';
const adminSecret = process.env.ADMIN_PANEL_SECRET ?? '';

export async function GET() {
  return forward('/admin/runtime-config', { method: 'GET' });
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  return forward('/admin/runtime-config', { method: 'PUT', body });
}

async function forward(path: string, init: RequestInit) {
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
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
