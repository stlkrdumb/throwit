'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { dAppKit } from './dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { WalletButton } from '@/components/WalletButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from 'next-themes';
import Link from 'next/link';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DAppKitProvider dAppKit={dAppKit}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b-4 border-black bg-card">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-[4px] bg-primary border-2 border-black flex items-center justify-center neo-shadow-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:neo-shadow-md transition-all duration-100">
                <span className="text-black font-mono text-sm font-black">↑</span>
              </div>
              <span className="font-display text-2xl tracking-wider text-foreground uppercase">
                throw<span className="text-primary">.it</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 w-full flex flex-col pb-8">{children}</main>
        </ThemeProvider>
      </DAppKitProvider>
      <Toaster richColors position="bottom-right" theme="system" />
    </QueryClientProvider>
  );
}
