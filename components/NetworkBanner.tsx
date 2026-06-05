'use client';

import { useEffect, useState } from 'react';
import { config } from '@/lib/config';

export function NetworkBanner() {
  const [provider, setProvider] = useState<'tatum' | 'official'>('tatum');
  const [mounted, setMounted] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [storedKey, setStoredKey] = useState('');
  const [envKey, setEnvKey] = useState('');

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('throwit_rpc_provider') as 'tatum' | 'official';
    if (stored) {
      setProvider(stored);
    }
    setStoredKey(localStorage.getItem('throwit_tatum_api_key') || '');
    setEnvKey(process.env.NEXT_PUBLIC_TATUM_API_KEY || '');
  }, []);

  useEffect(() => {
    if (showKeyInput) {
      setTempKey(localStorage.getItem('throwit_tatum_api_key') || '');
    }
  }, [showKeyInput]);

  const handleSwitch = (newProvider: 'tatum' | 'official') => {
    if (newProvider === provider) return;
    localStorage.setItem('throwit_rpc_provider', newProvider);
    setProvider(newProvider);
    window.location.reload();
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    if (trimmed) {
      localStorage.setItem('throwit_tatum_api_key', trimmed);
    } else {
      localStorage.removeItem('throwit_tatum_api_key');
    }
    setShowKeyInput(false);
    window.location.reload();
  };

  const handleClearKey = () => {
    localStorage.removeItem('throwit_tatum_api_key');
    setTempKey('');
    setShowKeyInput(false);
    window.location.reload();
  };

  if (!mounted) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-card border-t-3 border-black flex items-center px-6 text-xs font-mono select-none" />
    );
  }

  const keyExists = !!(storedKey || envKey);

  if (showKeyInput) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-8 bg-card border-t-3 border-black flex items-center px-6 text-xs font-mono select-none">
        <form
          onSubmit={handleSaveKey}
          className="flex items-center justify-between w-full gap-4"
        >
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <span className="text-[10px] text-muted-foreground uppercase">TATUM API KEY:</span>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder={envKey ? "Loaded from .env.local" : "Paste Tatum API Key..."}
              className="bg-background border border-black px-2 py-0.5 text-[10px] font-mono outline-none rounded-[2px] w-64 text-foreground focus:ring-1 focus:ring-primary focus:border-primary shadow-[1px_1px_0_rgba(0,0,0,0.15)]"
            />
            {storedKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="px-2 py-0.5 text-[9px] font-bold text-red-500 hover:text-red-700 bg-transparent border border-red-500/30 hover:border-red-500 rounded-[2px] transition-all cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground border border-black px-3 py-0.5 text-[9px] font-black uppercase rounded-[2px] cursor-pointer shadow-[1px_1px_0_#000] active:translate-y-[1px] active:translate-x-[1px]"
            >
              SAVE
            </button>
            <button
              type="button"
              onClick={() => setShowKeyInput(false)}
              className="text-muted-foreground hover:text-foreground text-[10px] font-bold px-1 cursor-pointer uppercase"
            >
              CANCEL
            </button>
          </div>
        </form>
      </footer>
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
        <div className="flex items-center gap-1.5 bg-muted border border-black p-0.5 rounded-[2px]">
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

        {/* API Key configuration button for Tatum */}
        {provider === 'tatum' && (
          <button
            onClick={() => setShowKeyInput(true)}
            className={`px-2 py-0.5 border border-black rounded-[2px] transition-all cursor-pointer text-[9px] font-black uppercase flex items-center gap-1 ${
              keyExists
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[1px_1px_0_#000]'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[1px_1px_0_#000] animate-pulse border border-black font-black'
            }`}
            title={keyExists ? "Tatum API Key configured. Click to change." : "Tatum API Key is missing! Click to configure."}
          >
            🔑 {keyExists ? 'KEY' : 'NO KEY!'}
          </button>
        )}
      </div>
    </footer>
  );
}
