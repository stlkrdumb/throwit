'use client';

import { useEffect, useState } from 'react';
import {
  useWallets,
  useCurrentAccount,
  useCurrentWallet,
  useDAppKit,
} from '@mysten/dapp-kit-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/lib/config';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const wallets = useWallets();
  const account = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const dAppKit = useDAppKit();
  
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    dAppKit.disconnectWallet();
    toast.info('Wallet disconnected');
  };

  const handleConnect = async (wallet: any) => {
    try {
      await dAppKit.connectWallet({ wallet });
      setDialogOpen(false);
      toast.success(`Connected to ${wallet.name}`);
    } catch (err) {
      toast.error('Failed to connect wallet');
    }
  };

  if (!mounted) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 h-9 px-3 text-xs font-medium cursor-not-allowed"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-500" />
        Detecting...
      </button>
    );
  }

  // Connected state: Dropdown Menu with details
  if (account) {
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
            {currentWallet?.icon ? (
              <img
                src={currentWallet.icon}
                alt={currentWallet.name}
                className="h-4 w-4 rounded-xs shrink-0"
              />
            ) : (
              <Wallet className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-mono text-xs text-slate-300">
              {truncateAddress(account.address)}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 border-slate-800 bg-slate-950 text-slate-200 p-1.5"
          >
            <div className="px-2 py-1.5 text-xs text-slate-500 font-medium select-none">
              Connected via {currentWallet?.name || 'Sui Wallet'}
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
              onClick={() => window.open(`https://suiscan.xyz/${config.network}/account/${account.address}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 cursor-pointer px-2 py-2 text-xs text-slate-300 focus:bg-slate-900 focus:text-slate-100 border border-transparent focus:border-slate-800 rounded-md outline-none transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              View on Suiscan
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-800/60" />

            <DropdownMenuItem
              onClick={handleDisconnect}
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

  // Disconnected state: Connect Wallet Dialog
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                onClick={() => handleConnect(wallet)}
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
