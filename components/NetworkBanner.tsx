'use client';

import { useEffect, useState } from 'react';
import { config } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

export function NetworkBanner() {
  const { authMode, setAuthMode, walletStatus, account, apiKeyConfigured, setApiKeyConfigured } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-10 bg-card border-t-3 border-black flex items-center justify-between px-6 text-xs font-mono select-none">
        {/* Left: Auth Mode Status */}
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <span className={`h-2 w-2 rounded-full border border-black shrink-0 ${
            authMode === 'onchain' ? 'bg-green-600' : 'bg-yellow-400 animate-pulse'
          }`} />
          <span>
            AUTH MODE: <span className="font-bold text-primary">{authMode === 'onchain' ? 'TATUM ONCHAIN' : 'TATUM GASLESS'}</span>
          </span>
        </div>

        {/* Right: Mode Switcher + API Key */}
        <div className="flex items-center gap-2">
          {/* Mode switcher */}
          <div className="flex items-center gap-1.5 bg-muted border border-black p-0.5 rounded-[2px]">
            <button
              onClick={() => setAuthMode('onchain')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
                authMode === 'onchain'
                  ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ONCHAIN
            </button>
            <button
              onClick={() => setAuthMode('gasless')}
              className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
                authMode === 'gasless'
                  ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              GASLESS
            </button>
          </div>

          {/* API Key change button (only in gasless mode) */}
          {authMode === 'gasless' && (
            <button
              onClick={() => setShowKeyInput(true)}
              className={`px-2 py-0.5 border border-black rounded-[2px] text-[9px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer shadow-[1px_1px_0_#000] ${
                apiKeyConfigured || process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300 animate-pulse'
              }`}
            >
              🔑 CHANGE API KEY
            </button>
          )}
        </div>
      </footer>
    );
  }

  // Show key input when toggled
  if (showKeyInput) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-10 bg-card border-t-3 border-black flex items-center justify-between px-6 text-xs font-mono select-none">
        <form onSubmit={handleSaveKey} className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <span className="text-[10px] text-muted-foreground uppercase">CHANGE API KEY:</span>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste new Tatum API Key..."
              className="bg-background border border-black px-2 py-0.5 text-[10px] font-mono outline-none rounded-[2px] w-64 focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 ml-2">
            {localStorage.getItem('throwit_tatum_api_key') && (
              <button
                type="button"
                onClick={handleClearKey}
                className="px-2 py-0.5 text-[9px] font-bold text-red-500 hover:text-red-700 bg-transparent border border-red-500/30 rounded-[2px] cursor-pointer uppercase"
              >
                CLEAR
              </button>
            )}
            <button
              type="submit"
              className="bg-primary text-primary-foreground border border-black px-3 py-0.5 text-[9px] font-black uppercase rounded-[2px] cursor-pointer shadow-[1px_1px_0_#000]"
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

  // Normal state with mode selector and API key button
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-10 bg-card border-t-3 border-black flex items-center justify-between px-6 text-xs font-mono select-none">
      {/* Left: Auth Mode Status */}
      <div className="flex items-center gap-2 text-foreground font-semibold">
        <span className={`h-2 w-2 rounded-full border border-black shrink-0 ${
          authMode === 'onchain' ? 'bg-green-600' : 'bg-yellow-400 animate-pulse'
        }`} />
        <span>
          AUTH MODE: <span className="font-bold text-primary">{authMode === 'onchain' ? 'TATUM ONCHAIN' : 'TATUM GASLESS'}</span>
        </span>
      </div>

      {/* Right: Mode Switcher + API Key */}
      <div className="flex items-center gap-2">
        {/* Mode switcher */}
        <div className="flex items-center gap-1.5 bg-muted border border-black p-0.5 rounded-[2px]">
          <button
            onClick={() => setAuthMode('onchain')}
            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              authMode === 'onchain'
                ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                : 'text-muted-foreground hover:text-foreground'
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
            className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
              authMode === 'gasless'
                ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            GASLESS
          </button>
        </div>

        {/* API Key change button (only in gasless mode) */}
        {authMode === 'gasless' && (
          <button
            onClick={() => setShowKeyInput(true)}
            className={`px-2 py-0.5 border border-black rounded-[2px] text-[9px] font-black uppercase flex items-center gap-1 transition-all cursor-pointer shadow-[1px_1px_0_#000] ${
              apiKeyConfigured || process.env.NEXT_PUBLIC_TATUM_API_KEY_MAINNET
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 animate-pulse'
            }`}
          >
            🔑 CHANGE API KEY
          </button>
        )}
      </div>
    </footer>
  );
}
