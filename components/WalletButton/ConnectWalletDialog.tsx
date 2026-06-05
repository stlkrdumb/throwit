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
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 h-9 px-4 gap-2 text-sm font-medium transition-all duration-200 active:translate-y-[1px] cursor-pointer select-none outline-none" />
        }
      >
        <Wallet className="h-4 w-4 text-slate-950" />
        Connect Wallet
      </DialogTrigger>

      <DialogContent className="border-slate-800 bg-slate-950 max-w-sm p-6">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-lg font-semibold text-slate-100">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Choose a wallet to connect to ThrowIt on Sui {config.network}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => onConnect(wallet).catch(() => {})}
                className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-200 hover:text-slate-100 text-sm font-medium transition-all duration-200 group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {wallet.icon ? (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="h-6 w-6 rounded-md shrink-0 transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <Wallet className="h-6 w-6 text-slate-400 shrink-0" />
                  )}
                  <span>{wallet.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50">
                  Detected
                </span>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-slate-800 bg-slate-900/20 rounded-xl">
              <ShieldAlert className="h-10 w-10 text-slate-500 mb-3" />
              <p className="text-sm font-medium text-slate-300">
                No Sui wallets detected
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                To upload files, you need a browser extension wallet for Sui.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfihmndjghplcoeceoeejiohgkej"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs font-medium text-slate-300 px-3 h-8 transition-colors"
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
