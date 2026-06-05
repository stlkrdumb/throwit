import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';

function getGrpcUrl(network: 'testnet' | 'mainnet'): string {
  if (network === 'mainnet') {
    return 'https://fullnode.mainnet.sui.io:443';
  }
  return 'https://fullnode.testnet.sui.io:443';
}

export const dAppKit = createDAppKit({
  networks: ['testnet', 'mainnet'],
  defaultNetwork: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as 'testnet' | 'mainnet',
  createClient: (network) => {
    return new SuiGrpcClient({
      network,
      baseUrl: getGrpcUrl(network),
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
