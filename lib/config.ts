// Single source of truth for network-aware configuration.
// Never mix networks — testnet blobs can't be fetched from mainnet and vice versa.

export const config = {
  network: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as
    | 'testnet'
    | 'mainnet',
  rpc: process.env.NEXT_PUBLIC_TATUM_RPC!,
  aggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const;

// Safety check: log loudly if running mainnet in dev
if (process.env.NODE_ENV === 'development' && config.network === 'mainnet') {
  console.warn(
    '⚠️  Running in development mode on MAINNET. Consider switching to testnet.'
  );
}
