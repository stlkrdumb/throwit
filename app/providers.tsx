'use client';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return;
    origError.apply(console, args);
  };
}

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
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

function NavbarLinks() {
  const pathname = usePathname();
  const { account, apiKeyConfigured, authMode } = useAuth();
  
  const isAuthorized = !!account || (authMode === 'gasless' && apiKeyConfigured);

  return (
    <nav className="flex items-center gap-2 flex-wrap justify-center my-2 md:my-0">
      <Link
        href="/"
        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 rounded-[4px] transition-all cursor-pointer ${
          pathname === '/'
            ? 'border-black bg-secondary text-black shadow-[2px_2px_0_#000]'
            : 'border-transparent text-foreground hover:border-black hover:bg-muted'
        }`}
      >
        Home
      </Link>
      
      {isAuthorized && (
        <Link
          href="/dashboard"
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 border-2 rounded-[4px] transition-all cursor-pointer ${
            pathname === '/dashboard'
              ? 'border-black bg-secondary text-black shadow-[2px_2px_0_#000]'
              : 'border-transparent text-foreground hover:border-black hover:bg-muted'
          }`}
        >
          Dashboard
        </Link>
      )}
    </nav>
  );
}

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
        const performProxyFetch = () => {
          const proxyUrl = `/api/walrus-node-proxy?target=${encodeURIComponent(url)}`;
          
          if (input instanceof Request) {
            const cloned = input.clone();
            const requestInit: RequestInit = {
              method: cloned.method,
              headers: cloned.headers,
              body: cloned.body,
              mode: cloned.mode,
              credentials: cloned.credentials,
              cache: cloned.cache,
              redirect: cloned.redirect,
              referrer: cloned.referrer,
              integrity: cloned.integrity,
              keepalive: cloned.keepalive,
              signal: cloned.signal,
            };
            if (init) {
              Object.assign(requestInit, init);
            }
            if (cloned.method === 'GET' || cloned.method === 'HEAD') {
              delete requestInit.body;
            }
            const newRequest = new Request(proxyUrl, requestInit);
            return originalFetch(newRequest);
          }
          
          return originalFetch(proxyUrl, init);
        };

        // If it is HTTP, we MUST proxy it because of mixed content rules in production
        if (url.startsWith('http://')) {
          console.log('[Fetch Interceptor] Proxying HTTP Walrus node request:', url);
          return performProxyFetch();
        }

        // If it is HTTPS, try direct fetch first to leverage HTTP/2 and avoid overloading local server
        try {
          // Clone the request if it is a Request instance, so that the original remains unconsumed if we fail.
          const directInput = input instanceof Request ? input.clone() : input;
          return await originalFetch(directInput, init);
        } catch (error) {
          console.warn('[Fetch Interceptor] Direct HTTPS request failed, falling back to proxy:', url, error);
          return performProxyFetch();
        }
      }

      return originalFetch(input, init);
    };
  }, []);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <DAppKitProvider dAppKit={dAppKit}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-3 border-b-4 border-black bg-card">
              <div className="flex items-center justify-between w-full md:w-auto">
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
              </div>

              <NavbarLinks />

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
