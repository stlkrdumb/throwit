import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { getActiveRpcUrl } from '@/lib/config';

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet',
  createClient: (network) => new SuiGrpcClient({ network, baseUrl: getActiveRpcUrl(network) }),
  autoConnect: true,
  slushWalletConfig: null, // desktop app, no Slush mobile wallet needed
});

// Register types for hook type inference
declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
