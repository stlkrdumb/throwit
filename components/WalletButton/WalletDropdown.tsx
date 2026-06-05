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

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center justify-center rounded-[4px] border-2 border-black bg-card hover:bg-secondary text-foreground hover:text-black h-9 px-3 gap-2 text-xs font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer select-none outline-none shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)]" />
          }
        >
          {walletIcon ? (
            <img
              src={walletIcon}
              alt={walletName}
              className="h-4 w-4 shrink-0"
            />
          ) : (
            <Wallet className="h-4 w-4 shrink-0" />
          )}
          <span className="font-mono text-xs">
            {truncateAddress(address)}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 border-3 border-black bg-card text-foreground p-1.5 shadow-[4px_4px_0_var(--color-primary)] rounded-[4px]"
        >
          <div className="px-2 py-1.5 text-xs font-mono text-muted-foreground uppercase tracking-wide">
            CONNECTED VIA {walletName || 'SUI WALLET'}
          </div>
          
          <DropdownMenuSeparator className="bg-black my-1.5 h-[2px]" />
          
          <DropdownMenuItem
            onClick={handleCopy}
            className="flex items-center justify-between cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-black focus:bg-secondary focus:text-black border border-transparent hover:border-black focus:border-black rounded-[4px] outline-none transition-all"
          >
            <span className="flex items-center gap-2">
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              COPY ADDRESS
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onViewOnSuiscan}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-secondary hover:text-black focus:bg-secondary focus:text-black border border-transparent hover:border-black focus:border-black rounded-[4px] outline-none transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            VIEW ON SUISCAN
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-black my-1.5 h-[2px]" />

          <DropdownMenuItem
            onClick={onDisconnect}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white border border-transparent hover:border-black focus:border-black rounded-[4px] outline-none transition-all"
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
