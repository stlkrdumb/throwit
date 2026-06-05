'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { UploadWrapper } from '@/components/UploadWrapper';
import { MyUploadsWrapper } from '@/components/MyUploadsWrapper';
import { WalletButton } from '@/components/WalletButton';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const account = useCurrentAccount();
  const { authMode, apiKeyConfigured, setShowLoginDialog } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-[calc(100vh-69px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary font-bold" />
          <span className="text-sm font-black uppercase tracking-wider text-foreground">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  const isAuthorized = !!account || (authMode === 'gasless' && apiKeyConfigured);

  // Not connected state: show bold request card
  if (!isAuthorized) {
    return (
      <div className="relative flex-1 w-full min-h-[calc(100vh-69px)] overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Decorative geometric shapes (solid fills, no blurs) */}
        <div className="absolute top-[8%] right-[12%] h-24 w-24 rounded-[4px] bg-primary border-3 border-black shadow-[4px_4px_0_#000] rotate-12 pointer-events-none" />
        <div className="absolute bottom-[12%] left-[10%] h-28 w-28 rounded-full bg-secondary border-3 border-black shadow-[4px_4px_0_#000] pointer-events-none" />
        <div className="absolute top-[40%] left-[15%] h-16 w-16 bg-[#4CAF50] border-3 border-black shadow-[3px_3px_0_#000] rounded-[4px] -rotate-45 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 rounded-[4px] border-3 border-black bg-card text-center flex flex-col items-center gap-5 shadow-[8px_8px_0_var(--color-secondary)]">
          <div className="h-14 w-14 rounded-[4px] bg-secondary border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
            <Lock className="h-6 w-6 text-black" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-wider text-foreground">Access Required</h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto text-center">
              Connect your Sui wallet or set up a Tatum API key to access the encrypted sharing workspace.
            </p>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowLoginDialog(true)}
              className="h-9 px-4 rounded-[4px] border-2 border-black bg-primary text-primary-foreground font-bold uppercase text-xs tracking-wider shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)] transition-all cursor-pointer"
            >
              Login / API Key
            </button>
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  // Connected state: show centered file-sharing console
  return (
    <div className="relative flex-1 w-full min-h-[calc(100vh-69px)] overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative geometric shapes */}
      <div className="absolute top-[5%] left-[8%] h-24 w-24 rounded-[4px] bg-primary border-3 border-black shadow-[4px_4px_0_#000] -rotate-12 pointer-events-none" />
      <div className="absolute bottom-[8%] right-[10%] h-24 w-24 rounded-full bg-[#4CAF50] border-3 border-black shadow-[4px_4px_0_#000] pointer-events-none" />
      <div className="absolute top-[35%] right-[8%] h-16 w-16 bg-secondary border-3 border-black shadow-[3px_3px_0_#000] rounded-[4px] rotate-45 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <UploadWrapper />
      </div>

      {/* Slide-out History and Rebate Manager */}
      <MyUploadsWrapper />
    </div>
  );
}

