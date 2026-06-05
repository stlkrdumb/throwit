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
          <button className="inline-flex items-center justify-center rounded-[4px] bg-primary text-primary-foreground h-9 px-4 gap-2 text-xs font-bold uppercase tracking-wide border-2 border-black transition-all duration-100 cursor-pointer select-none outline-none shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)]" />
        }
      >
        <Wallet className="h-4 w-4 text-primary-foreground" />
        Connect Wallet
      </DialogTrigger>

      <DialogContent className="border-3 border-black bg-card text-foreground max-w-sm p-6 shadow-[6px_6px_0_var(--color-secondary)] rounded-[4px]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-muted-foreground">
            CHOOSE A WALLET TO CONNECT TO THROWIT ON SUI {config.network.toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => onConnect(wallet).catch(() => {})}
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
                <span className="text-[10px] font-mono text-black uppercase tracking-wide px-2 py-0.5 rounded-[4px] bg-secondary border border-black">
                  DETECTED
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-black bg-muted rounded-[4px]">
              <ShieldAlert className="h-10 w-10 text-red-500 mb-3" />
              <p className="text-sm font-black uppercase tracking-wide text-foreground">
                NO SUI WALLETS DETECTED
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-2 max-w-[240px]">
                TO UPLOAD FILES, YOU NEED A BROWSER EXTENSION WALLET FOR SUI.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-[4px] border-2 border-black bg-secondary hover:bg-primary text-xs font-bold uppercase tracking-wide text-black px-3 h-8 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)]"
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
