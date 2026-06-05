'use client';

import { useEffect, useState } from 'react';
import { useWallets, useCurrentAccount, useCurrentWallet, useDAppKit } from '@mysten/dapp-kit-react';
import { Loader2 } from 'lucide-react';
import { ConnectWalletDialog } from './ConnectWalletDialog';
import { WalletDropdown } from './WalletDropdown';

export function WalletButton() {
  const wallets = useWallets();
  const account = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const dAppKit = useDAppKit();
  
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async (wallet: any) => {
    try {
      await dAppKit.connectWallet({ wallet });
      setDialogOpen(false);
    } catch {
      // Toast handled by dApp-kit auto
    }
  };

  const handleDisconnect = () => {
    dAppKit.disconnectWallet();
  };

  const onViewOnSuiscan = () => {
    if (!account) return;
    window.open(`https://suiscan.xyz/testnet/account/${account.address}`, '_blank', 'noopener,noreferrer');
  };

  if (!mounted) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center rounded-[4px] border-2 border-black bg-card text-foreground h-9 px-3 text-xs font-bold uppercase tracking-wide cursor-not-allowed neo-shadow-sm"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground" />
        Detecting...
      </button>
    );
  }

  // Connected state: Dropdown menu with details
  if (account) {
    return (
      <WalletDropdown
        walletIcon={currentWallet?.icon}
        walletName={currentWallet?.name || ''}
        address={account.address}
        onViewOnSuiscan={onViewOnSuiscan}
        onDisconnect={handleDisconnect}
      />
    );
  }

  // Disconnected state: Connect dialog
  return (
    <ConnectWalletDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      wallets={wallets}
      onConnect={handleConnect}
    />
  );
}
