// Single source of truth for network-aware configuration.
// Never mix networks — testnet blobs can't be fetched from mainnet and vice versa.

const network = (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';

export const config = {
  network,
  rpc: process.env.NEXT_PUBLIC_TATUM_RPC || 
    (network === 'mainnet' ? 'https://fullnode.mainnet.sui.io:443' : 'https://fullnode.testnet.sui.io:443'),
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
