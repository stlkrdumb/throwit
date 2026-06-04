import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';

// gRPC endpoints — uses Tatum RPC from env vars
const GRPC_URLS: Record<string, string> = {
  testnet: process.env.NEXT_PUBLIC_TATUM_RPC || 'https://fullnode.testnet.sui.io:443',
  mainnet: process.env.NEXT_PUBLIC_TATUM_RPC || 'https://fullnode.mainnet.sui.io:443',
} as const;

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet',
  createClient: (network) => new SuiGrpcClient({ network, baseUrl: GRPC_URLS[network] }),
  autoConnect: true,
});

// Register types for hook type inference
declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
