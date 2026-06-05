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
      <div className="flex-1 w-full flex items-center justify-center bg-slate-950 min-h-[calc(100vh-69px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-sm font-medium text-slate-400">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Not connected state: show premium request card
  if (!account) {
    return (
      <div className="relative flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Glowing auras */}
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-md text-center flex flex-col items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Lock className="h-5 w-5 text-emerald-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-100">Access Restricted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your Sui wallet to access your encrypted sharing workspace. You will be able to encrypt files, pay for Walrus blob storage, and manage refunds.
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
    <div className="relative flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative ambient gradients */}
      <div className="absolute top-[-30%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Upload card container */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/25 to-indigo-500/25 opacity-30 blur-xl group-hover:opacity-40 transition duration-300" />
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
