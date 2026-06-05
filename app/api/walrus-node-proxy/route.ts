import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import { parse } from 'url';

// Helper function to perform the HTTP/HTTPS request using node's built-in modules
function requestWithNode(
  targetUrl: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer | undefined
): Promise<{ status: number; headers: Record<string, string>; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = parse(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const options: http.RequestOptions & https.RequestOptions = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path || '/',
      headers,
      // Disables TLS unauthorized rejection specifically for this connection
      rejectUnauthorized: false,
    };

    const req = requestModule.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      res.on('end', () => {
        const resBody = Buffer.concat(chunks);
        const resHeaders: Record<string, string> = {};
        for (const [key, val] of Object.entries(res.headers)) {
          if (val !== undefined) {
            resHeaders[key] = Array.isArray(val) ? val.join(', ') : val;
          }
        }
        resolve({
          status: res.statusCode || 200,
          headers: resHeaders,
          body: resBody,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

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

    // 2. Read request body as Buffer
    const bodyBuffer = await request.arrayBuffer();
    const body = bodyBuffer.byteLength > 0 ? Buffer.from(bodyBuffer) : undefined;

    // 3. Forward request using Node's standard module (specifically disabling TLS check)
    const proxyResponse = await requestWithNode(targetUrl, request.method, headers, body);

    // 4. Copy response headers, ensuring CORS is enabled
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
    };
    for (const [key, value] of Object.entries(proxyResponse.headers)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'access-control-allow-origin') {
        responseHeaders[key] = value;
      }
    }

    return new NextResponse(new Uint8Array(proxyResponse.body), {
      status: proxyResponse.status,
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
