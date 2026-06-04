'use client';

import { Clock3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EXPIRY_OPTIONS, ExpiryOption } from '@/hooks/useFileUpload';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';
import { WalletButton } from '@/components/WalletButton';
import { useCurrentAccount } from '@mysten/dapp-kit-react';

export function ReadyState() {
  const { state, actions } = useUploadContext();
  const account = useCurrentAccount();
  const { fileInfo, selectedHours } = state;
  const { setSelectedHours, executeUpload, resetUpload } = actions;

  if (!fileInfo) return null;

  return (
    <>
      <FileInfoRow
        name={fileInfo.name}
        size={fileInfo.size}
        variant="default"
        onRemove={resetUpload}
      />

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          Storage Duration
        </label>
        <Tabs value={String(selectedHours)} onValueChange={(v) => setSelectedHours(Number(v))}>
          <TabsList className="w-full grid grid-cols-4 bg-slate-800/40 border border-slate-700/50">
            {EXPIRY_OPTIONS.map((opt: ExpiryOption) => (
              <TabsTrigger
                key={opt.label}
                value={String(opt.hours)}
                className="text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300 ring-0 focus-visible:ring-0"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {account ? (
          <Button
            onClick={executeUpload}
            className="w-full text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all duration-200 active:translate-y-[1px]"
          >
            Encrypt & Upload
          </Button>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
            <p className="text-xs text-slate-400 text-center">
              A connected Sui wallet is required to pay for gas and register storage.
            </p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
