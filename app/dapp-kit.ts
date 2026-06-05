import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { getRpcHeaders, FallbackTransport, getRpcFallbackUrls } from '@/lib/config';

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet',
  createClient: (network) => {
    const transport = new FallbackTransport(
      getRpcFallbackUrls(network),
      getRpcHeaders()
    );
    return new SuiJsonRpcClient({
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
