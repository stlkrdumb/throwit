// Single source of truth for network-aware configuration.
// Never mix networks — testnet blobs can't be fetched from mainnet and vice versa.

const network = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';

export function getActiveRpcUrl(net: 'testnet' | 'mainnet'): string {
  if (typeof window === 'undefined') {
    // SSR default: use Tatum SUI gRPC Gateway
    return net === 'mainnet'
      ? (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-mainnet-grpc.gateway.tatum.io')
      : (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-testnet-grpc.gateway.tatum.io');
  }

  const provider = localStorage.getItem('throwit_rpc_provider') || 'tatum';
  if (provider === 'official') {
    return net === 'mainnet'
      ? 'https://fullnode.mainnet.sui.io:443'
      : 'https://fullnode.testnet.sui.io:443';
  } else {
    // Default to Tatum SUI gRPC Gateway
    return net === 'mainnet'
      ? (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-mainnet-grpc.gateway.tatum.io')
      : (process.env.NEXT_PUBLIC_TATUM_RPC || 'https://sui-testnet-grpc.gateway.tatum.io');
  }
}

export function getRpcHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    const envKey = process.env.NEXT_PUBLIC_TATUM_API_KEY;
    return envKey ? { 'x-api-key': envKey } : {};
  }

  const provider = localStorage.getItem('throwit_rpc_provider') || 'tatum';
  if (provider === 'official') {
    return {};
  }

  const customKey = localStorage.getItem('throwit_tatum_api_key');
  if (customKey) {
    return { 'x-api-key': customKey };
  }

  const envKey = process.env.NEXT_PUBLIC_TATUM_API_KEY;
  if (envKey) {
    return { 'x-api-key': envKey };
  }

  return {};
}

export const config = {
  network,
  get rpc() { return getActiveRpcUrl(network); },
  aggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 
    (network === 'mainnet' ? 'https://aggregator.walrus.site' : 'https://aggregator.testnet.walrus.site'),
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Safety check: log loudly if running mainnet in dev
if (process.env.NODE_ENV === 'development' && config.network === 'mainnet') {
  console.warn(
    '⚠️  Running in development mode on MAINNET. Consider switching to testnet.'
  );
}
