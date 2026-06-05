import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = path ? path.join('/') : '';

    // 1. Determine target network and base URL
    const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
    const isMainnet = network === 'mainnet';
    
    // Default Tatum gRPC gateways
    let tatumBaseUrl = isMainnet
      ? 'https://sui-mainnet-grpc.gateway.tatum.io'
      : 'https://sui-testnet-grpc.gateway.tatum.io';

    // Honor NEXT_PUBLIC_TATUM_RPC if configured as a gRPC endpoint
    const envRpc = process.env.NEXT_PUBLIC_TATUM_RPC;
    if (envRpc && envRpc.includes('-grpc.')) {
      tatumBaseUrl = envRpc;
    }

    const targetUrl = `${tatumBaseUrl}/${pathStr}`;

    // 2. Extract headers from incoming client request
    const apiKey = request.headers.get('x-api-key');
    const contentType = request.headers.get('content-type') || 'application/grpc-web-text';

    // Standard gRPC backend expects binary payloads ('application/grpc')
    const headers: Record<string, string> = {
      'content-type': 'application/grpc',
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    } else {
      // Fallback to environment API key if client didn't supply one in headers
      const envKey = isMainnet
        ? process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET
        : process.env.NEXT_PUBLIC_TATUM_API_KEY_TESTNET;
      if (envKey) {
        headers['x-api-key'] = envKey;
      }
    }

    // 3. Read request body as ArrayBuffer and decode base64 if client uses text-format gRPC-web
    let bodyBuffer = await request.arrayBuffer();
    const isTextFormat = contentType.startsWith('application/grpc-web-text');

    if (isTextFormat) {
      const base64Str = new TextDecoder().decode(bodyBuffer);
      const binaryBuffer = Buffer.from(base64Str, 'base64');
      bodyBuffer = binaryBuffer.buffer.slice(binaryBuffer.byteOffset, binaryBuffer.byteOffset + binaryBuffer.byteLength) as ArrayBuffer;
    }

    // 4. Forward the binary request to Tatum gRPC gateway
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: bodyBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[gRPC Proxy] Error forwarding to Tatum ${targetUrl}:`, errorText);
      return new NextResponse(errorText, { status: response.status });
    }

    // 5. Read binary response body
    const binaryBody = new Uint8Array(await response.arrayBuffer());

    // 6. Construct gRPC-web trailer frame
    // Since browsers cannot access HTTP/2 trailers in fetch, we serialize the status and message
    // into a gRPC-web trailer frame (flag 0x80) and append it to the body stream.
    const grpcStatus = response.headers.get('grpc-status') || '0';
    const grpcMessage = response.headers.get('grpc-message') || '';
    let trailerStr = `grpc-status:${grpcStatus}\r\n`;
    if (grpcMessage) {
      trailerStr += `grpc-message:${grpcMessage}\r\n`;
    }

    const trailerBytes = new TextEncoder().encode(trailerStr);
    const trailerHeader = new Uint8Array(5);
    trailerHeader[0] = 0x80; // Trailer frame flag
    const len = trailerBytes.length;
    trailerHeader[1] = (len >> 24) & 0xff;
    trailerHeader[2] = (len >> 16) & 0xff;
    trailerHeader[3] = (len >> 8) & 0xff;
    trailerHeader[4] = len & 0xff;

    // Concatenate binary body and trailer frame
    const fullBinaryResponse = new Uint8Array(binaryBody.length + 5 + trailerBytes.length);
    fullBinaryResponse.set(binaryBody, 0);
    fullBinaryResponse.set(trailerHeader, binaryBody.length);
    fullBinaryResponse.set(trailerBytes, binaryBody.length + 5);

    let resBuffer: ArrayBuffer;
    if (isTextFormat) {
      // 7. Encode the entire stream (body + trailers) to base64 for text-format gRPC-web
      const base64Str = Buffer.from(
        fullBinaryResponse.buffer,
        fullBinaryResponse.byteOffset,
        fullBinaryResponse.byteLength
      ).toString('base64');
      resBuffer = new TextEncoder().encode(base64Str).buffer as ArrayBuffer;
    } else {
      resBuffer = fullBinaryResponse.buffer.slice(
        fullBinaryResponse.byteOffset,
        fullBinaryResponse.byteOffset + fullBinaryResponse.byteLength
      ) as ArrayBuffer;
    }

    // Override Content-Type if it is standard 'application/grpc'
    // browser clients (GrpcWebFetchTransport) expect 'application/grpc-web' variant
    let resContentType = response.headers.get('content-type') || 'application/grpc-web-text';
    if (resContentType === 'application/grpc') {
      resContentType = contentType; // Match incoming client request content-type
    }

    const responseHeaders: Record<string, string> = {
      'content-type': resContentType,
    };

    // Forward gRPC status and other response headers from Tatum to the client
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('grpc-') || lowerKey.startsWith('x-grpc-')) {
        responseHeaders[lowerKey] = value;
      }
    });

    return new NextResponse(resBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[gRPC Proxy] Unexpected proxy error:', error);
    return new NextResponse('Internal Proxy Error', { status: 500 });
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-grpc-web, x-accept-grpc-web',
    },
  });
}

export const dynamic = 'force-dynamic';
