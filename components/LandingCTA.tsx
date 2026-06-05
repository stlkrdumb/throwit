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
import { Wallet, ShieldAlert, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';

export function LandingCTA() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        className="inline-flex items-center gap-2 px-6 h-12 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent text-[var(--neo-text-muted)] text-xs font-bold uppercase tracking-wide cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  if (account) {
    return (
      <button
        onClick={() => router.push('/dashboard')}
        className="group inline-flex items-center gap-2 px-6 h-12 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)] border-[3px] border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 active:translate-y-[1px] neo-button-like cursor-pointer"
        style={{ boxShadow: '4px 4px 0 var(--neo-black)' }}
      >
        Launch Dashboard
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
      </button>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        render={
          <button className="group inline-flex items-center gap-2 px-6 h-12 rounded-[var(--neo-radius-md)] bg-[var(--neo-lime)] border-[3px] border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 active:translate-y-[1px] neo-button-like cursor-pointer" style={{ boxShadow: '4px 4px 0 var(--neo-black)' }}>
            Start Sharing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
          </button>
        }
      >
        Start Sharing
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
      </DialogTrigger>

      <DialogContent className="border-[var(--neo-border-bold)] bg-white max-w-sm p-6 neo-shadow-lg rounded-[var(--neo-radius-md)]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-[var(--neo-text-primary)]">Connect Wallet</DialogTitle>
          <DialogDescription className="text-xs font-mono text-[var(--neo-text-muted)]">CHOOSE A WALLET TO CONNECT TO THROWIT ON SUI {config.network.toUpperCase()}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet)}
                className="flex items-center justify-between w-full p-3 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-slate-100 text-[var(--neo-text-primary)] text-sm font-bold transition-all duration-100 group active:scale-[0.99] cursor-pointer neo-button-like"
              >
                <div className="flex items-center gap-3">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="h-6 w-6 rounded-[var(--neo-radius-sm)] shrink-0 transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <Wallet className="h-6 w-6 text-[var(--neo-text-muted)] shrink-0" />
                  )}
                  <span>{wallet.name}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--neo-text-muted)] uppercase tracking-wide px-2 py-0.5 rounded-[var(--neo-radius-sm)] bg-slate-200 border border-slate-800">DETECTED</span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800 bg-transparent rounded-[var(--neo-radius-md)]">
              <ShieldAlert className="h-10 w-10 text-[var(--neo-text-muted)] mb-3" />
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">No Sui Wallets Detected</p>
              <p className="text-xs font-mono text-[var(--neo-text-muted)] mt-2 max-w-[220px]">TO UPLOAD FILES, YOU NEED A BROWSER EXTENSION WALLET FOR SUI.</p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[var(--neo-radius-sm)] border-2 border-black bg-transparent hover:bg-slate-100 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-muted)] px-3 h-8 transition-all neo-button-like"
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
