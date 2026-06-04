'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { dAppKit } from './dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { WalletButton } from '@/components/WalletButton';
import Link from 'next/link';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DAppKitProvider dAppKit={dAppKit}>
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-95 transition-opacity">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-500/55 flex items-center justify-center transition-colors">
              <span className="text-emerald-400 font-mono text-sm font-bold">↑</span>
            </div>
            <span className="font-semibold tracking-tight text-base text-slate-100">
              throw<span className="text-emerald-400">.it</span>
            </span>
          </Link>
          <WalletButton />
        </header>
        <main className="flex-1 w-full flex flex-col">{children}</main>
      </DAppKitProvider>
      <Toaster richColors position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
