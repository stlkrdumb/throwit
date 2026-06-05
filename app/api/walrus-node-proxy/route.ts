import { NextRequest, NextResponse } from 'next/server';

// Disable SSL certificate validation for proxy requests to avoid operator SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  try {
    const targetUrl = request.nextUrl.searchParams.get('target');
    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    // 1. Copy headers from incoming client request, removing host-specific ones
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'host' &&
        lowerKey !== 'origin' &&
        lowerKey !== 'referer' &&
        lowerKey !== 'content-length'
      ) {
        headers[key] = value;
      }
    });

    // 2. Read request body as ArrayBuffer
    const bodyBuffer = await request.arrayBuffer();

    // 3. Forward request to target Walrus node server-side
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
    });

    // 4. Copy response headers, ensuring CORS is enabled
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
    };
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'access-control-allow-origin') {
        responseHeaders[key] = value;
      }
    });

    // 5. Read response body
    const resBuffer = await response.arrayBuffer();

    return new NextResponse(resBuffer, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Walrus Node Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Walrus node', details: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export const dynamic = 'force-dynamic';
