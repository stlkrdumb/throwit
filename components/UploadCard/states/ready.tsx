'use client';

import { Clock3, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EXPIRY_OPTIONS, ExpiryOption, formatFileSize } from '@/hooks/useFileUpload';
import { useUploadContext } from '../context';
import { WalletButton } from '@/components/WalletButton';
import { useCurrentAccount } from '@mysten/dapp-kit-react';

export function ReadyState() {
  const { state, actions } = useUploadContext();
  const account = useCurrentAccount();
  const { fileInfos, totalSize, selectedHours } = state;
  const { setSelectedHours, executeUpload, removeFile } = actions;

  if (!fileInfos || fileInfos.length === 0) return null;

  return (
    <>
      {/* File list */}
      <div className="space-y-2">
        {fileInfos.map((info, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/40 group hover:border-slate-700 transition-colors">
            {account ? (
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-md flex items-center justify-center hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all shrink-0"
                title={`Remove ${info.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <span className="text-xs font-mono text-slate-600 w-5 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{info.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(info.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-500">{fileInfos.length} file{fileInfos.length > 1 ? 's' : ''}</span>
        <span className="font-mono text-slate-400">{formatFileSize(totalSize)}</span>
      </div>

      {/* Expiry */}
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
            Encrypt & Upload {fileInfos.length > 1 ? `(${fileInfos.length} files)` : ''}
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
