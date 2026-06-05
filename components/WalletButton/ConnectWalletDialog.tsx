'use client';

import { Wallet, ExternalLink, ShieldAlert } from 'lucide-react';
import type { UiWallet } from '@mysten/dapp-kit-core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { config } from '@/lib/config';

interface ConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: UiWallet[];
  onConnect: (wallet: UiWallet) => Promise<void>;
}

export function ConnectWalletDialog({ open, onOpenChange, wallets, onConnect }: ConnectWalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <button className="inline-flex items-center justify-center rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)] hover:bg-[var(--neo-pink)]/90 text-black h-9 px-4 gap-2 text-xs font-bold uppercase tracking-wide border-[3px] border-black transition-all duration-100 active:translate-y-[1px] cursor-pointer select-none outline-none neo-button-like"
            style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </button>
        }
      >
        <Wallet className="h-4 w-4 text-black" />
        Connect Wallet
      </DialogTrigger>

      <DialogContent className="border-[var(--neo-border-bold)] bg-[var(--neo-surface)] max-w-sm p-6 neo-shadow-lg rounded-[var(--neo-radius-md)]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-[var(--neo-text-primary)]">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-[var(--neo-text-muted)]">
            CHOOSE A WALLET TO CONNECT TO THROWIT ON SUI {config.network.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => onConnect(wallet).catch(() => {})}
                className="flex items-center justify-between w-full p-3 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-slate-800/50 hover:border-slate-700 text-[var(--neo-text-primary)] text-sm font-bold transition-all duration-100 group active:scale-[0.99] cursor-pointer neo-button-like"
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
                <span className="text-[10px] font-mono text-[var(--neo-text-muted)] uppercase tracking-wide px-2 py-0.5 rounded-[var(--neo-radius-sm)] bg-slate-800 border border-slate-700">
                  DETECTED
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-slate-800 bg-transparent rounded-[var(--neo-radius-md)]">
              <ShieldAlert className="h-10 w-10 text-[var(--neo-text-muted)] mb-3" />
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">
                NO SUI WALLETS DETECTED
              </p>
              <p className="text-xs font-mono text-[var(--neo-text-muted)] mt-2 max-w-[240px]">
                TO UPLOAD FILES, YOU NEED A BROWSER EXTENSION WALLET FOR SUI.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 hover:bg-slate-800 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-muted)] px-3 h-8 transition-all neo-button-like"
              >
                INSTALL SUI WALLET
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
