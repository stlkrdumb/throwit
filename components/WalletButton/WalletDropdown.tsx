'use client';

import { useState } from 'react';
import { Wallet, Copy, Check, ChevronDown, ExternalLink, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface WalletDropdownProps {
  walletIcon?: string;
  walletName: string;
  address: string;
  onViewOnSuiscan: () => void;
  onDisconnect: () => void;
}

export function WalletDropdown({ walletIcon, walletName, address, onViewOnSuiscan, onDisconnect }: WalletDropdownProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Network Badge */}
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--neo-radius-sm)] bg-transparent border-[2px] border-[var(--neo-lime)]/30 text-[10px] font-mono font-bold uppercase tracking-wide text-[var(--neo-lime)]">
        <span className="h-1.5 w-1.5 rounded-sm bg-[var(--neo-lime)] animate-pulse" />
        {config.network.toUpperCase()}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center justify-center rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-slate-800/50 text-[var(--neo-text-primary)] h-9 px-3 gap-2 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--neo-cyan)] focus-visible:ring-offset-2 neo-button-like" />
          }
        >
          {walletIcon ? (
            <img
              src={walletIcon}
              alt={walletName}
              className="h-4 w-4 shrink-0"
            />
          ) : (
            <Wallet className="h-4 w-4 text-[var(--neo-cyan)] shrink-0" />
          )}
          <span className="font-mono text-xs text-[var(--neo-text-primary)]">
            {truncateAddress(address)}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--neo-text-muted)]" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 border-[var(--neo-border-bold)] bg-[var(--neo-surface)] text-[var(--neo-text-primary)] p-1.5 neo-shadow-lg rounded-[var(--neo-radius-md)]"
        >
          <div className="px-2 py-1.5 text-xs font-mono text-[var(--neo-text-muted)] uppercase tracking-wide">
            CONNECTED VIA {walletName || 'SUI WALLET'}
          </div>
          
          <DropdownMenuSeparator className="bg-slate-800" />
          
          <DropdownMenuItem
            onClick={handleCopy}
            className="flex items-center justify-between cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-primary)] focus:bg-slate-800 focus:text-[var(--neo-text-primary)] border border-transparent rounded-[var(--neo-radius-sm)] outline-none transition-all"
          >
            <span className="flex items-center gap-2">
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--neo-lime)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--neo-text-muted)]" />}
              COPY ADDRESS
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onViewOnSuiscan}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-primary)] focus:bg-slate-800 focus:text-[var(--neo-text-primary)] border border-transparent rounded-[var(--neo-radius-sm)] outline-none transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[var(--neo-cyan)]" />
            VIEW ON SUISCAN
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-800" />

          <DropdownMenuItem
            onClick={onDisconnect}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wide text-[var(--neo-red)] focus:bg-[var(--neo-red)]/10 border border-transparent rounded-[var(--neo-radius-sm)] outline-none transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            DISCONNECT WALLET
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
