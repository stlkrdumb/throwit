'use client';

import { useEffect, useState } from 'react';
import { config } from '@/lib/config';

export function NetworkBanner() {
  const [provider, setProvider] = useState<'tatum' | 'official'>('tatum');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('throwit_rpc_provider') as 'tatum' | 'official';
    if (stored) {
      setProvider(stored);
    }
  }, []);

  const handleSwitch = (newProvider: 'tatum' | 'official') => {
    if (newProvider === provider) return;
    localStorage.setItem('throwit_rpc_provider', newProvider);
    setProvider(newProvider);
    window.location.reload();
  };

  if (!mounted) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-card border-t-3 border-black flex items-center px-6 text-xs font-mono select-none" />
    );
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-card border-t-3 border-black flex items-center justify-between px-6 text-xs font-mono select-none">
      {/* Left: Active Network Status */}
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse border border-black shrink-0" />
        <span>
          NETWORK STATUS: <span className="font-bold text-primary">SUI {config.network.toUpperCase()}</span>
        </span>
      </div>

      {/* Right: RPC Provider Switcher */}
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <span className="text-[10px] text-muted-foreground uppercase">SUI RPC:</span>
        <div className="flex items-center gap-1 bg-muted border border-black p-0.5 rounded-[2px]">
          <button
            onClick={() => handleSwitch('tatum')}
            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              provider === 'tatum'
                ? 'bg-primary text-primary-foreground border border-black font-black shadow-[1px_1px_0_#000] translate-x-[-0.5px] translate-y-[-0.5px]'
                : 'text-muted-foreground hover:text-foreground font-semibold border border-transparent'
            }`}
            title="Use high-performance Tatum RPC infrastructure (Required for Tatum tools prize)"
          >
            Tatum Gateway
          </button>
          <button
            onClick={() => handleSwitch('official')}
            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              provider === 'official'
                ? 'bg-primary text-primary-foreground border border-black font-black shadow-[1px_1px_0_#000] translate-x-[-0.5px] translate-y-[-0.5px]'
                : 'text-muted-foreground hover:text-foreground font-semibold border border-transparent'
            }`}
            title="Use standard official SUI fullnode RPC"
          >
            Official Node
          </button>
        </div>
      </div>
    </footer>
  );
}
