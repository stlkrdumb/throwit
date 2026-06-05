import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient, GrpcWebFetchTransport } from '@mysten/sui/grpc';
import { getActiveRpcUrl, getRpcHeaders } from '@/lib/config';

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet',
  createClient: (network) => {
    const transport = new GrpcWebFetchTransport({
      baseUrl: getActiveRpcUrl(network),
      meta: getRpcHeaders(),
    });
    return new SuiGrpcClient({
      network,
      transport,
    });
  },
  autoConnect: true,
  slushWalletConfig: null, // desktop app, no Slush mobile wallet needed
});

// Register types for hook type inference
declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
