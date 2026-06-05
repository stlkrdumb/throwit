// Single source of truth for network-aware configuration.
// Never mix networks — testnet blobs can't be fetched from mainnet and vice versa.



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

// Kept for backward compatibility — no longer used by Walrus or dAppKit (now using gRPC)
export function getRpcHeaders(): Record<string, string> {
  return { 'x-sui-network': config.network };
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

// Kept for backward compatibility — no longer used (now using gRPC)
export function getRpcFallbackUrls(net: 'testnet' | 'mainnet'): string[] {
  return [
    getActiveRpcUrl(net),
    net === 'mainnet' ? 'https://fullnode.mainnet.sui.io:443' : 'https://fullnode.testnet.sui.io:443',
  ];
}

// Kept for backward compatibility — no longer used (now using gRPC)
export class FallbackTransport {
  private urls: string[];

  constructor(urls: string[], _headers: Record<string, string>) {
    this.urls = urls;
  }

  async request<T>(_input: unknown): Promise<T> {
    throw new Error("FallbackTransport is deprecated — use SuiGrpcClient instead");
  }
}
