import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the API key from headers or query params
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing Tatum API key' },
        { status: 401 }
      );
    }

    // Determine the network requested (mainnet or testnet)
    const requestedNetwork = request.headers.get('x-sui-network') || process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
    
    // Select Tatum URL dynamically
    const tatumRpcUrl = process.env.NEXT_PUBLIC_TATUM_RPC || (requestedNetwork === 'mainnet'
      ? 'https://sui-mainnet.gateway.tatum.io'
      : 'https://sui-testnet.gateway.tatum.io');

    // Parse the JSON-RPC request
    const body = await request.json();
    
    // Forward the request to Tatum's RPC endpoint
    const response = await fetch(tatumRpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Tatum RPC error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Tatum proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Tatum RPC endpoint' },
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}

export const dynamic = 'force-dynamic';
