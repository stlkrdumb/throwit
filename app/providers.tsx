'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { dAppKit } from './dapp-kit';
import { Toaster } from '@/components/ui/sonner';
import { LoginButton } from '@/components/LoginButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NetworkBanner } from '@/components/NetworkBanner';
// ThemeProvider must be imported dynamically to avoid SSR issues
import dynamic from 'next/dynamic';
const ThemeProvider = dynamic(() => import('next-themes').then((mod) => mod.ThemeProvider), {
  ssr: false,
});
import { useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      // Intercept direct Walrus node requests (e.g. port 9185, or containing /v1/blobs/ or /v1/store)
      if (
        (url.includes(':9185') || url.includes('/v1/blobs/') || url.includes('/v1/store')) &&
        !url.includes('/api/')
      ) {
        console.log('[Fetch Interceptor] Proxying Walrus node request:', url);
        const proxyUrl = `/api/walrus-node-proxy?target=${encodeURIComponent(url)}`;
        return originalFetch(proxyUrl, init);
      }

      return originalFetch(input, init);
    };
  }, []);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <DAppKitProvider dAppKit={dAppKit}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b-4 border-black bg-card">
              <Link href="/" className="flex items-center gap-3 group">
                <img
                  src="/throwit-logo.svg"
                  alt="throw.it logo"
                  className="h-12 w-12 object-contain transition-all duration-100 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px]"
                />
                <span className="font-display text-3xl tracking-wider text-foreground uppercase flex items-center font-bold">
                  THROW
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LoginButton />
              </div>
            </header>
            <main className="flex-1 w-full flex flex-col pb-8">{children}</main>
            <NetworkBanner />
          </AuthProvider>
        </ThemeProvider>
      </DAppKitProvider>
      <Toaster richColors position="bottom-right" theme="system" />
    </QueryClientProvider>
  );
}
