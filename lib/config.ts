// Single source of truth for network-aware configuration.
// Never mix networks — testnet blobs can't be fetched from mainnet and vice versa.

import { JsonRpcHTTPTransport, type JsonRpcTransport, type JsonRpcTransportRequestOptions } from '@mysten/sui/jsonRpc';

const network = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';

export function getActiveRpcUrl(net: 'testnet' | 'mainnet'): string {
  if (typeof window === 'undefined') {
    // SSR default: use Tatum SUI JSON-RPC Gateway
    return net === 'mainnet'
      ? (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-mainnet.gateway.tatum.io')
      : (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-testnet.gateway.tatum.io');
  }

  const provider = localStorage.getItem('throwit_rpc_provider') || 'official';
  if (provider === 'official') {
    return net === 'mainnet'
      ? 'https://fullnode.mainnet.sui.io:443'
      : 'https://fullnode.testnet.sui.io:443';
  } else {
    // Default to Tatum SUI JSON-RPC Gateway (via local proxy to bypass CORS)
    return `${window.location.origin}/api/tatum-proxy`;
  }
}

// Get the appropriate API key for storage operations
export function getStorageApiKey(): string {
  if (typeof window === 'undefined') {
    // SSR: use mainnet key for storage (storage API only works on mainnet)
    return process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET || '';
  }

  // On client: prefer local override, fallback to env var
  const customKey = localStorage.getItem('throwit_tatum_api_key');
  if (customKey) return customKey;

  // Storage API only works on mainnet, so always use mainnet key
  return process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET || '';
}

export function getRpcHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'x-sui-network': config.network,
  };

  if (typeof window === 'undefined') {
    const envKey = process.env.NEXT_PUBLIC_TATUM_API_KEY;
    if (envKey) headers['x-api-key'] = envKey;
    return headers;
  }

  const provider = localStorage.getItem('throwit_rpc_provider') || 'official';
  if (provider === 'official') {
    return headers;
  }

  // Storage API always uses mainnet key; RPC may use testnet or mainnet
  const isMainnetNetwork = config.network === 'mainnet';
  const storageKey = getStorageApiKey();
  if (storageKey) {
    headers['x-api-key'] = storageKey;
    return headers;
  }

  // Fallback: use environment API key (may be testnet or mainnet)
  const envKey = isMainnetNetwork 
    ? process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET
    : process.env.NEXT_PUBLIC_TATUM_API_KEY_TESTNET;
  if (envKey) {
    headers['x-api-key'] = envKey;
  }

  return headers;
}

export const config = {
  network,
  get rpc() { return getActiveRpcUrl(network); },
  aggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 
    (network === 'mainnet' ? 'https://aggregator.walrus.site' : 'https://aggregator.testnet.walrus.site'),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  storageApiUrl: process.env.NEXT_PUBLIC_TATUM_STORAGE_API || 'https://api.tatum.io',
} as const;

// Safety check: log loudly if running mainnet in dev
if (process.env.NODE_ENV === 'development' && config.network === 'mainnet') {
  console.warn(
    '⚠️  Running in development mode on MAINNET. Consider switching to testnet.'
  );
}

export function getRpcFallbackUrls(net: 'testnet' | 'mainnet'): string[] {
  const urls: string[] = [];
  
  // 1. Configured provider (Tatum proxy or official)
  urls.push(getActiveRpcUrl(net));
  
  // 2. Official public Sui RPC
  const officialUrl = net === 'mainnet'
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443';
    
  if (!urls.includes(officialUrl)) {
    urls.push(officialUrl);
  }
  
  // 3. Popular public RPC fallbacks for Mainnet
  if (net === 'mainnet') {
    urls.push('https://sui-mainnet.node.nodes.guru:443');
    urls.push('https://mainnet.sui.rpcpool.com');
  }
  
  return urls;
}

export class FallbackTransport implements JsonRpcTransport {
  private transports: JsonRpcHTTPTransport[];

  constructor(urls: string[], headers: Record<string, string>) {
    this.transports = urls.map(url => new JsonRpcHTTPTransport({
      url,
      rpc: {
        // Only pass custom authentication headers if the URL goes through the Tatum proxy or Tatum domain
        headers: url.includes('tatum-proxy') || url.includes('tatum.io') ? headers : { 'x-sui-network': config.network },
      }
    }));
  }

  async request<T>(input: JsonRpcTransportRequestOptions): Promise<T> {
    let lastError: any = null;
    for (let i = 0; i < this.transports.length; i++) {
      try {
        return await this.transports[i].request<T>(input);
      } catch (err) {
        lastError = err;
        console.warn(`[FallbackTransport] RPC Request failed on node ${i} (${this.transports[i].fetch.name || 'sui-rpc'}), trying next fallback...`, err);
      }
    }
    throw lastError || new Error("All Sui RPC node transports failed");
  }
}
