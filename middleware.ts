import { NextRequest, NextResponse } from 'next/server';

// CORS headers for gRPC-Web requests to Tatum
const GRPC_WEB_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, grpc-web-token',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request: NextRequest) {
  // Handle preflight CORS requests for gRPC-Web
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: GRPC_WEB_CORS_HEADERS,
    });
  }

  // Check if this is a gRPC-Web request to Tatum
  const url = request.nextUrl;
  if (url.pathname.includes('/grpc') || request.headers.get('x-api-key')) {
    const response = NextResponse.next();
    
    // Add CORS headers for gRPC-Web compatibility
    Object.entries(GRPC_WEB_CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/grpc/:path*'],
};
