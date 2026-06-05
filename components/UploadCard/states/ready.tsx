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
      {/* File list — neobrutalist panel */}
      <div className="space-y-2">
        {fileInfos.map((info, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--neo-radius-sm)] border-[2px] border-slate-800 bg-[var(--neo-page-bg)] group hover:border-slate-700 transition-all neo-hover-lift">
            {account ? (
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-[var(--neo-radius-sm)] flex items-center justify-center hover:bg-[var(--neo-red)]/20 text-[var(--neo-text-muted)] hover:text-[var(--neo-red)] transition-all shrink-0"
                title={`Remove ${info.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <span className="text-xs font-mono text-[var(--neo-text-muted)] w-5 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--neo-text-primary)] truncate font-medium">{info.name}</p>
              <p className="text-[10px] font-mono text-[var(--neo-text-muted)]">{formatFileSize(info.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-xs px-1 py-2 border-t-[var(--neo-border-bold)] border-slate-800">
        <span className="text-[var(--neo-text-muted)] uppercase font-bold">{fileInfos.length} file{fileInfos.length > 1 ? 's' : ''}</span>
        <span className="font-mono text-[var(--neo-text-primary)]">{formatFileSize(totalSize)}</span>
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide text-[var(--neo-text-muted)] flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-[var(--neo-cyan)]" />
          Storage Duration
        </label>
        <Tabs value={String(selectedHours)} onValueChange={(v) => setSelectedHours(Number(v))}>
          <TabsList className="w-full grid grid-cols-4 bg-[var(--neo-page-bg)] border-[var(--neo-border-bold)] rounded-[var(--neo-radius-sm)]">
            {EXPIRY_OPTIONS.map((opt: ExpiryOption) => (
              <TabsTrigger
                key={opt.label}
                value={String(opt.hours)}
                className="text-xs font-bold uppercase tracking-wide text-[var(--neo-text-muted)] hover:text-[var(--neo-text-primary)] data-[state=active]:bg-[var(--neo-cyan)]/20 data-[state=active]:text-[var(--neo-cyan)] ring-0 focus-visible:ring-0"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {account ? (
          <button
            onClick={executeUpload}
            className="w-full text-sm font-bold uppercase tracking-wide py-3 rounded-[var(--neo-radius-sm)] border-[3px] border-black bg-[var(--neo-pink)] text-black hover:-translate-y-[2px] transition-all duration-100 active:translate-y-[1px]"
            style={{ boxShadow: '4px 4px 0 var(--neo-black)' }}
          >
            Encrypt & Upload {fileInfos.length > 1 ? `(${fileInfos.length} FILES)` : ''}
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-[var(--neo-radius-md)] border-[var(--neo-border-bold)] bg-[var(--neo-page-bg)]">
            <p className="text-xs font-mono text-[var(--neo-text-muted)] text-center">
              CONNECT A WALLET TO UPLOAD
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
