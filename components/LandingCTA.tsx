'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { ArrowRight, Loader2, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LandingCTA() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { setShowLoginDialog, apiKeyConfigured } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-6 h-12 rounded-[4px] border-2 border-black bg-card text-foreground text-xs font-bold uppercase tracking-wide cursor-not-allowed neo-shadow-sm"
      >
        <Loader2 className="h-4 w-4 animate-spin text-foreground" />
        Loading...
      </button>
    );
  }

  if (account) {
    return (
      <button
        onClick={() => router.push('/dashboard')}
        className="group inline-flex items-center gap-2 px-6 h-12 rounded-[4px] bg-primary text-primary-foreground border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:neo-shadow-lg active:translate-x-[2px] active:translate-y-[2px] active:neo-shadow-sm"
      >
        Launch Dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-primary-foreground" />
      </button>
    );
  }

  if (apiKeyConfigured) {
    return (
      <button
        onClick={() => router.push('/dashboard')}
        className="group inline-flex items-center gap-2 px-6 h-12 rounded-[4px] bg-yellow-400 text-black border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)]"
      >
        <Key className="h-4 w-4 text-black" />
        Launch Dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowLoginDialog(true)}
      className="group inline-flex items-center gap-2 px-6 h-12 rounded-[4px] bg-secondary border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)] text-black"
    >
      Start Sharing
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
    </button>
  );
}
