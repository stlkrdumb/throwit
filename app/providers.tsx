'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DAppKitProvider, useDAppKit, useCurrentAccount, useWallets } from '@mysten/dapp-kit-react';
import { dAppKit } from './dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { Wallet, Loader2 } from 'lucide-react';

// Wrapper that waits for client-side wallet detection
function WalletButton() {
  const wallets = useWallets();
  const [detected, setDetected] = useState(false);
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();

  // Mark as detected once we have wallet info (prevents hydration mismatch)
  useEffect(() => { setDetected(true); }, []);

  if (!account && detected && wallets.length > 0) {
    return (
      <button
        onClick={() => dAppKit.connectWallet({ wallet: wallets[0] })}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
      >
        <Wallet className="h-3.5 w-3.5" /> Connect
      </button>
    );
  }

  // During hydration (not detected yet) or no wallet available
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50">
      {detected ? (
        wallets.length > 0 ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-slate-400">{account?.address.slice(0, 6)}…{account?.address.slice(-4) ?? ''}</span>
          </>
        ) : (
          <span className="text-xs text-slate-600">No wallet</span>
        )
      ) : (
        <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
      )}
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DAppKitProvider dAppKit={dAppKit}>
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
          <span className="font-semibold tracking-tight text-lg">🎒 ThrowIt</span>
          <WalletButton />
        </header>
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">{children}</main>
      </DAppKitProvider>
      <Toaster richColors position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
