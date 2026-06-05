'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { UploadWrapper } from '@/components/UploadWrapper';
import { MyUploadsWrapper } from '@/components/MyUploadsWrapper';
import { WalletButton } from '@/components/WalletButton';
import { Loader2, Lock } from 'lucide-react';

export default function Dashboard() {
  const account = useCurrentAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-[calc(100vh-69px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--neo-pink)]" />
          <span className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-muted)]">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Not connected state: show bold request card
  if (!account) {
    return (
      <div className="relative flex-1 w-full min-h-[calc(100vh-69px)] overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Decorative geometric shapes (no blurs) */}
        <div className="absolute top-[5%] right-[10%] h-24 w-24 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)]/5 border-2 border-[var(--neo-pink)]/10" />
        <div className="absolute bottom-[10%] left-[8%] h-32 w-32 rounded-full bg-[var(--neo-cyan)]/5 border-2 border-[var(--neo-cyan)]/10" />
        <div className="absolute top-[40%] left-[20%] h-16 w-16 bg-[var(--neo-lime)]/3 border-2 border-[var(--neo-lime)]/10 rounded-sm rotate-45" />

        <div className="relative z-10 w-full max-w-md p-8 rounded-[var(--neo-radius-md)] border-[var(--neo-border-bold)] bg-[var(--neo-surface)] text-center flex flex-col items-center gap-5 neo-shadow-lg">
          <div className="h-14 w-14 rounded-[var(--neo-radius-md)] bg-[var(--neo-lime)]/15 border-3 border-[var(--neo-lime)] flex items-center justify-center neo-shadow-sm">
            <Lock className="h-6 w-6 text-[var(--neo-lime)]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight text-[var(--neo-text-primary)]">Access Required</h1>
            <p className="text-xs font-mono text-[var(--neo-text-muted)] leading-relaxed max-w-sm mx-auto">
              CONNECT YOUR SUI WALLET TO ACCESS THE ENCRYPTED SHARING WORKSPACE. ENCRYPT FILES, PAY FOR WALRUS STORAGE, AND MANAGE REFUNDS.
            </p>
          </div>

          <div className="mt-2">
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
      <div className="absolute top-[3%] left-[5%] h-28 w-28 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)]/4 border-2 border-[var(--neo-pink)]/10" />
      <div className="absolute bottom-[5%] right-[8%] h-20 w-20 rounded-full bg-[var(--neo-cyan)]/4 border-2 border-[var(--neo-cyan)]/10" />
      <div className="absolute top-[35%] right-[15%] h-16 w-16 bg-[var(--neo-lime)]/2 border-2 border-[var(--neo-lime)]/10 rounded-sm -rotate-12" />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Upload card container */}
        <div className="relative group">
          {/* Hard shadow background (no gradient) */}
          <div className="absolute -inset-[3px] rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)]/10 transition duration-200 group-hover:opacity-60" />
          <div className="relative z-10 w-full">
            <UploadWrapper />
          </div>
        </div>
      </div>

      {/* Slide-out History and Rebate Manager */}
      <MyUploadsWrapper />
    </div>
  );
}
