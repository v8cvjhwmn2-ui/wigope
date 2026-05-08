import { NextRequest, NextResponse } from 'next/server';

const backendBase = process.env.BACKEND_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1';
const adminSecret = process.env.ADMIN_PANEL_SECRET ?? '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${backendBase}/admin/runtime-config/test-sms`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
    },
    body,
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}
