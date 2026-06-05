'use client';

import { useState, useEffect, useRef } from 'react';
import { Wallet, Key, Loader2, LogOut, CheckCircle, ChevronDown, Copy, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function LoginButton() {
  const { 
    authMode, 
    setAuthMode, 
    walletStatus, 
    account, 
    availableWallets,
    loginWithWallet,
    logout,
    showLoginDialog,
    setShowLoginDialog,
    apiKeyConfigured,
    setApiKeyConfigured,
  } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load saved key on mount (one-time)
  if (typeof window !== 'undefined' && !savedKey) {
    const stored = localStorage.getItem('throwit_tatum_api_key');
    if (stored) setSavedKey(stored);
  }

  // Click-outside to close dropdown
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleApikeyLogin = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setKeyError('Please enter a valid API key');
      return;
    }
    localStorage.setItem('throwit_tatum_api_key', trimmed);
    setApiKeyConfigured(true);
    setAuthMode('gasless');
    setShowLoginDialog(false);
    setShowKeyInput(false);
    setApiKey('');
    setKeyError('');
  };

  const handleClearApikey = () => {
    localStorage.removeItem('throwit_tatum_api_key');
    setApiKeyConfigured(false);
    setSavedKey('');
    if (authMode === 'gasless' && !account) {
      setAuthMode('onchain');
    }
    setShowKeyInput(false);
    setShowKeyInput(false);
    setApiKey('');
    setMenuOpen(false);
  };

  const handleWalletLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleCopyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSwitchMode = () => {
    setAuthMode(authMode === 'onchain' ? 'gasless' : 'onchain');
    setMenuOpen(false);
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '****';
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
  };

  // Loading state
  if (walletStatus === 'connecting') {
    return (
      <button className="inline-flex items-center gap-2 h-9 px-4 rounded-[4px] border-2 border-black bg-primary text-primary-foreground font-bold uppercase text-xs cursor-not-allowed shadow-[3px_3px_0_var(--color-primary)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  // ============== CONNECTED: WALLET ==============
  if (account && walletStatus === 'connected') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[4px] border-2 border-black bg-yellow-400 text-black font-bold uppercase text-xs cursor-pointer hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0_var(--color-secondary)]"
        >
          <CheckCircle className="h-4 w-4" />
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
          <ChevronDown className={`h-3 w-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 z-50 border-2 border-black bg-card shadow-[4px_4px_0_#000] rounded-[4px] overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b-2 border-black bg-yellow-400 text-black">
              <div className="text-[9px] font-black uppercase tracking-wider opacity-80">Connected Wallet</div>
              <div className="text-xs font-mono font-bold truncate mt-0.5">{account.address}</div>
            </div>

            {/* Actions */}
            <div className="p-1.5 space-y-1">
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Address'}
                </span>
              </button>

              <button
                onClick={handleSwitchMode}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Switch to {authMode === 'onchain' ? 'Gasless' : 'Onchain'}
                </span>
              </button>

              <div className="h-px bg-border my-1" />

              <button
                onClick={handleWalletLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============== CONNECTED: API KEY (GASLESS) ==============
  if (apiKeyConfigured && authMode === 'gasless') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[4px] border-2 border-black bg-yellow-400 text-black font-bold uppercase text-xs cursor-pointer hover:bg-yellow-300 active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0_var(--color-secondary)]"
        >
          <Key className="h-4 w-4" />
          API KEY SET
          <ChevronDown className={`h-3 w-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 z-50 border-2 border-black bg-card shadow-[4px_4px_0_#000] rounded-[4px] overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b-2 border-black bg-yellow-400 text-black">
              <div className="text-[9px] font-black uppercase tracking-wider opacity-80">Tatum API Key</div>
              <div className="text-xs font-mono font-bold mt-0.5">{maskKey(savedKey)}</div>
            </div>

            {/* Actions */}
            <div className="p-1.5 space-y-1">
              <button
                onClick={() => { setMenuOpen(false); setShowLoginDialog(true); }}
                className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] hover:bg-muted cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Change API Key
                </span>
              </button>

              {account && (
                <button
                  onClick={handleSwitchMode}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] hover:bg-muted cursor-pointer transition-colors"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Switch to Onchain
                </button>
              )}

              <div className="h-px bg-border my-1" />

              <button
                onClick={handleClearApikey}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase rounded-[2px] bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear API Key
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============== DISCONNECTED ==============
  return (
    <>
      <button
        onClick={() => setShowLoginDialog(true)}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-[4px] border-2 border-black bg-primary text-primary-foreground font-bold uppercase text-xs cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)] transition-all shadow-[2px_2px_0_var(--color-primary)]"
      >
        <Wallet className="h-4 w-4" />
        Login
      </button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="border-3 border-black bg-card text-foreground max-w-md p-6 shadow-[6px_6px_0_var(--color-secondary)] rounded-[4px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Login to ThrowIt
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {/* Auth mode selector */}
            <div className="p-3 rounded-[4px] border-2 border-black bg-muted text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground uppercase">Auth Mode:</span>
                <span className="font-bold text-primary">
                  {authMode === 'onchain' ? 'TATUM ONCHAIN' : 'TATUM GASLESS'}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAuthMode('onchain')}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
                    authMode === 'onchain'
                      ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  ONCHAIN (Wallet)
                </button>
                <button
                  onClick={() => setAuthMode('gasless')}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-[2px] transition-all cursor-pointer ${
                    authMode === 'gasless'
                      ? 'bg-primary text-primary-foreground border border-black shadow-[1px_1px_0_#000]'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  GASLESS (API Key)
                </button>
              </div>
            </div>

            {/* Wallet login */}
            {authMode === 'onchain' && availableWallets.length > 0 ? (
              <button
                onClick={loginWithWallet}
                className="w-full flex items-center justify-between px-4 gap-3 h-12 rounded-[4px] border-2 border-black bg-muted hover:bg-secondary text-foreground font-bold text-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)] transition-all"
              >
                <div className="flex items-center gap-2">
                  {availableWallets[0]?.icon ? (
                    <img src={availableWallets[0].icon} alt={availableWallets[0].name} className="h-6 w-6 rounded-[4px]" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                  <span>{availableWallets[0]?.name || 'Sui Wallet'}</span>
                </div>
                <span className="text-[10px] font-mono text-black uppercase tracking-wide px-2 py-0.5 rounded-[4px] bg-secondary border border-black">
                  DETECTED
                </span>
              </button>
            ) : authMode === 'onchain' && availableWallets.length === 0 ? (
              <div className="flex flex-col items-center p-6 text-center border-2 border-black bg-muted rounded-[4px] gap-3">
                <Wallet className="h-10 w-10 text-foreground" />
                <p className="text-sm font-black uppercase tracking-wide text-foreground">
                  No Wallet Detected
                </p>
                <a
                  href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[4px] border-2 border-black bg-secondary hover:bg-primary text-xs font-bold uppercase tracking-wide text-black px-3 h-8 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)]"
                >
                  Install Sui Wallet
                </a>
              </div>
            ) : null}

            {/* API Key login */}
            {authMode === 'gasless' && !showKeyInput ? (
              <button
                onClick={() => setShowKeyInput(true)}
                className="w-full flex items-center justify-between gap-3 h-12 px-4 rounded-[4px] border-2 border-black bg-muted hover:bg-secondary text-foreground font-bold text-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <span>Enter API Key</span>
                </div>
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-wide px-2 py-0.5 rounded-[4px] bg-red-100 border border-red-500">
                  REQUIRED
                </span>
              </button>
            ) : null}

            {/* API Key input form */}
            {authMode === 'gasless' && showKeyInput && (
              <div className="space-y-3 p-3 rounded-[4px] border-2 border-black bg-background">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setKeyError('');
                  }}
                  placeholder="Paste Tatum API Key..."
                  className="w-full h-10 px-3 rounded-[4px] border-2 border-black bg-muted text-xs font-mono outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                {keyError && (
                  <p className="text-xs text-red-500 font-bold uppercase">{keyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleApikeyLogin}
                    className="flex-1 h-9 rounded-[4px] border-2 border-black bg-primary text-primary-foreground font-bold uppercase text-xs cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[2px_2px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setShowKeyInput(false); setApiKey(''); setKeyError(''); }}
                    className="px-3 h-9 rounded-[4px] border-2 border-black bg-muted text-foreground font-bold uppercase text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
