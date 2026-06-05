'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react';
import { UploadWrapper } from '@/components/UploadWrapper';
import { MyUploadsWrapper } from '@/components/MyUploadsWrapper';
import { WalletButton } from '@/components/WalletButton';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  // Not connected: premium request card
  if (!account) {
    return (
      <div className="flex-1 w-full min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm text-center flex flex-col items-center gap-5 px-8 py-10">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-semibold text-slate-100">Access Required</h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[260px] mx-auto">
              Connect your Sui wallet to access your encrypted file sharing workspace. Encrypt, store on Walrus, and manage refunds.
            </p>
          </div>

          <WalletButton />
        </div>
      </div>
    );
  }

  // Connected: bento dashboard layout
  return (
    <div className="flex-1 w-full min-h-[100dvh] bg-slate-950 p-4 sm:p-6">
      {/* Top bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-100">Workspace</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Encrypted file sharing on Walrus · {account.address.slice(0, 6)}…{account.address.slice(-4)}</p>
        </div>
        <button
          onClick={() => dAppKit.disconnectWallet()}
          className="px-3 h-8 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Bento grid */}
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4">
        {/* Upload Card */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm p-6">
          <UploadWrapper />
        </div>

        {/* My Uploads Panel */}
        <div>
          <MyUploadsWrapper />
        </div>
      </div>
    </div>
  );
}
