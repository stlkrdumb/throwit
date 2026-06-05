'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useWallets, useDAppKit } from '@mysten/dapp-kit-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, ShieldAlert, ArrowRight, Loader2, ExternalLink, Key } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';

export function LandingCTA() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if API key is configured
    if (typeof window !== 'undefined') {
      setApiKeyConfigured(!!localStorage.getItem('throwit_tatum_api_key'));
    }
  }, []);

  // Redirect to dashboard automatically if wallet is connected while dialog is open or after connection
  useEffect(() => {
    if (mounted && account) {
      setDialogOpen(false);
    }
  }, [account, mounted]);

  const handleConnect = async (wallet: any) => {
    try {
      await dAppKit.connectWallet({ wallet });
      toast.success(`Connected to ${wallet.name}`);
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to connect wallet');
    }
  };

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

  // If API key is configured, allow direct access to dashboard
  if (apiKeyConfigured) {
    return (
      <button
        onClick={() => router.push('/dashboard')}
        className="group inline-flex items-center gap-2 px-6 h-12 rounded-[4px] bg-yellow-400 text-black border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)]"
      >
        <Key className="h-4 w-4" />
        Launch Dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
      </button>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <button className="group inline-flex items-center gap-2 px-6 h-12 rounded-[4px] bg-secondary border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)] text-black">
            Start Sharing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
          </button>
        }
      >
        Start Sharing
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
      </DialogTrigger>

      <DialogContent className="border-3 border-black bg-card text-foreground max-w-sm p-6 shadow-[6px_6px_0_var(--color-secondary)] rounded-[4px]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground">Connect Wallet</DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">CHOOSE A WALLET TO CONNECT TO THROWIT ON SUI {config.network.toUpperCase()}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet)}
                className="flex items-center justify-between w-full p-3 rounded-[4px] border-2 border-black bg-muted hover:bg-secondary text-foreground hover:text-black text-sm font-bold transition-all duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="h-6 w-6 rounded-[4px] shrink-0"
                    />
                  ) : (
                    <Wallet className="h-6 w-6 text-foreground shrink-0" />
                  )}
                  <span>{wallet.name}</span>
                </div>
                <span className="text-[10px] font-mono text-black uppercase tracking-wide px-2 py-0.5 rounded-[4px] bg-secondary border border-black">DETECTED</span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-black bg-muted rounded-[4px]">
              <ShieldAlert className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">No Sui Wallets Detected</p>
              <p className="text-xs font-mono text-muted-foreground mt-2 max-w-[220px]">TO UPLOAD FILES, YOU NEED A BROWSER EXTENSION WALLET FOR SUI.</p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[4px] border-2 border-black bg-secondary hover:bg-primary text-xs font-bold uppercase tracking-wide text-black px-3 h-8 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)]"
              >
                Install Sui Wallet
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
