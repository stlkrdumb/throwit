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
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ExternalLink, Menu, X, Key } from 'lucide-react';

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

function MobileTatumSettings() {
  const { authMode, setAuthMode, apiKeyConfigured, setApiKeyConfigured } = useAuth();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    if (showKeyInput) {
      setTempKey(localStorage.getItem('throwit_tatum_api_key') || '');
    }
  }, [showKeyInput]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    if (trimmed) {
      localStorage.setItem('throwit_tatum_api_key', trimmed);
      setApiKeyConfigured(true);
      setAuthMode('gasless');
    } else {
      localStorage.removeItem('throwit_tatum_api_key');
      setApiKeyConfigured(false);
    }
    setShowKeyInput(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem('throwit_tatum_api_key');
    setApiKeyConfigured(false);
    setTempKey('');
    setShowKeyInput(false);
  };

  return (
    <div className="flex flex-col gap-3 mt-auto border-t-2 border-black pt-4">
      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Tatum Configuration</span>
      
      {/* Auth Mode Toggle */}
      <div className="flex items-center justify-between bg-muted border-2 border-black p-1 rounded-[4px] text-xs font-mono">
        <span className="font-bold text-[10px] pl-1 text-foreground">MODE:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setAuthMode('onchain')}
            className={`px-2 py-1 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              authMode === 'onchain'
                ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            ONCHAIN
          </button>
          <button
            onClick={() => {
              setAuthMode('gasless');
              if (!apiKeyConfigured) {
                setShowKeyInput(true);
              }
            }}
            className={`px-2 py-1 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              authMode === 'gasless'
                ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                : 'text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            GASLESS
          </button>
        </div>
      </div>

      {/* API Key management */}
      {authMode === 'gasless' && (
        <div className="flex flex-col gap-2">
          {showKeyInput ? (
            <form onSubmit={handleSaveKey} className="flex flex-col gap-2 p-2 border-2 border-black bg-muted rounded-[4px]">
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Tatum API Key:</span>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste Tatum API Key..."
                className="bg-card border-2 border-black px-2 py-1 text-[10px] font-mono outline-none rounded-[4px] focus:ring-1 focus:ring-primary text-foreground w-full animate-in fade-in duration-100"
              />
              <div className="flex gap-1.5 justify-end mt-1">
                {localStorage.getItem('throwit_tatum_api_key') && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="px-2 py-1 text-[9px] font-bold text-red-500 hover:text-red-700 bg-transparent border border-red-500/30 rounded-[2px] cursor-pointer uppercase"
                  >
                    CLEAR
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground border-2 border-black px-3 py-1 text-[9px] font-black uppercase rounded-[2px] cursor-pointer shadow-[1px_1px_0_#000]"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(false)}
                  className="text-muted-foreground hover:text-foreground text-[9px] font-bold px-1 cursor-pointer uppercase"
                >
                  CANCEL
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowKeyInput(true)}
              className={`w-full py-2 border-2 border-black rounded-[4px] text-[10px] font-black uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0_#000] ${
                apiKeyConfigured || process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300 animate-pulse'
              }`}
            >
              🔑 {apiKeyConfigured ? 'CHANGE API KEY' : 'SETUP API KEY'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { account, apiKeyConfigured, authMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthorized = !!account || (authMode === 'gasless' && apiKeyConfigured);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 h-16 border-b-4 border-black bg-card w-full select-none">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/throwit-logo.svg"
              alt="throw.it logo"
              className="h-9 w-9 md:h-11 md:w-11 object-contain transition-all duration-100 group-hover:translate-x-[-1px] group-hover:translate-y-[-1px]"
            />
            <span className="font-display text-2xl md:text-3xl tracking-wider text-foreground uppercase flex items-center font-bold">
              THROW
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavbarLinks />
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LoginButton />
        </div>

        {/* Mobile Actions/Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="h-9 w-9 rounded-[4px] border-2 border-black bg-primary text-primary-foreground flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer outline-none transition-all"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 md:hidden transition-opacity duration-200"
          />
          {/* Drawer Container */}
          <div className="fixed top-0 right-0 z-50 h-screen w-[280px] bg-card border-l-4 border-black p-6 flex flex-col gap-6 md:hidden shadow-[-6px_0_0_var(--color-primary)] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="font-display text-2xl tracking-wider text-foreground uppercase font-bold">
                MENU
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-destructive hover:text-white flex items-center justify-center text-foreground transition-all cursor-pointer shadow-[2px_2px_0_#000]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Navigation</span>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider px-3 py-2 border-2 rounded-[4px] transition-all cursor-pointer text-center ${
                  pathname === '/'
                    ? 'border-black bg-secondary text-black shadow-[2px_2px_0_#000]'
                    : 'border-transparent text-foreground hover:border-black hover:bg-muted bg-muted/30'
                }`}
              >
                Home
              </Link>
              {isAuthorized && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold uppercase tracking-wider px-3 py-2 border-2 rounded-[4px] transition-all cursor-pointer text-center ${
                    pathname === '/dashboard'
                      ? 'border-black bg-secondary text-black shadow-[2px_2px_0_#000]'
                      : 'border-transparent text-foreground hover:border-black hover:bg-muted bg-muted/30'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Authentication & Account */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Account / Wallet</span>
              <div className="flex w-full justify-center">
                <LoginButton />
              </div>
            </div>

            {/* Tatum Gasless/Onchain Configuration (Mobile specific) */}
            <MobileTatumSettings />
          </div>
        </>
      )}

      <main className="flex-1 w-full flex flex-col pb-12 md:pb-8">{children}</main>
      <NetworkBanner />
    </>
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
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </DAppKitProvider>
      <Toaster richColors position="bottom-right" theme="system" />
    </QueryClientProvider>
  );
}
