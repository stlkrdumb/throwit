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
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {config.network.toUpperCase()}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200 h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 active:scale-98 cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-emerald-500" />
          }
        >
          {walletIcon ? (
            <img
              src={walletIcon}
              alt={walletName}
              className="h-4 w-4 rounded-xs shrink-0"
            />
          ) : (
            <Wallet className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-mono text-xs text-slate-300">
            {truncateAddress(address)}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 border-slate-800 bg-slate-950 text-slate-200 p-1.5"
        >
          <div className="px-2 py-1.5 text-xs text-slate-500 font-medium select-none">
            Connected via {walletName || 'Sui Wallet'}
          </div>
          
          <DropdownMenuSeparator className="bg-slate-800/60" />
          
          <DropdownMenuItem
            onClick={handleCopy}
            className="flex items-center justify-between cursor-pointer px-2 py-2 text-xs text-slate-300 focus:bg-slate-900 focus:text-slate-100 border border-transparent focus:border-slate-800 rounded-md outline-none transition-all"
          >
            <span className="flex items-center gap-2">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              Copy Address
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onViewOnSuiscan}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs text-slate-300 focus:bg-slate-900 focus:text-slate-100 border border-transparent focus:border-slate-800 rounded-md outline-none transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            View on Suiscan
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-800/60" />

          <DropdownMenuItem
            onClick={onDisconnect}
            className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs text-red-400 focus:bg-red-950/20 focus:text-red-300 border border-transparent focus:border-red-900/30 rounded-md outline-none transition-all"
          >
            <LogOut className="h-3.5 w-3.5 text-red-400" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
