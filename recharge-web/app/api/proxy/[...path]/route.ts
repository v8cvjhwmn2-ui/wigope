import { NextResponse, type NextRequest } from 'next/server';
import { SERVER_API_BASE_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'origin',
  'referer',
  'sec-fetch-dest',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-user',
  'transfer-encoding'
]);

type ProxyContext = {
  params: {
    path?: string[];
  };
};

function buildTargetUrl(request: NextRequest, path: string[] = []) {
  const base = SERVER_API_BASE_URL.replace(/\/$/, '');
  const joinedPath = path.map((segment) => encodeURIComponent(segment)).join('/');
  const target = new URL(`${base}/${joinedPath}`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  return target;
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set('Accept', 'application/json');
  return headers;
}

function proxyCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept',
    'Cache-Control': 'no-store'
  };
}

async function proxy(request: NextRequest, context: ProxyContext) {
  const targetUrl = buildTargetUrl(request, context.params.path);
  const hasBody = !['GET', 'HEAD'].includes(request.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: buildForwardHeaders(request),
      body: hasBody ? await request.text() : undefined,
      cache: 'no-store'
    });

    const body = await upstream.text();
    const responseHeaders = new Headers(proxyCorsHeaders());
    const contentType = upstream.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reach production API.';
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: {
          code: 'PROXY_NETWORK_ERROR',
          message,
          details: { target: targetUrl.origin }
        }
      },
      { status: 502, headers: proxyCorsHeaders() }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: proxyCorsHeaders() });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
