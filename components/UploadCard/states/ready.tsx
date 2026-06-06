'use client';

import { Clock3, Trash2, FolderArchive } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EXPIRY_OPTIONS, ExpiryOption, formatFileSize } from '@/hooks/useFileUpload';
import { useUploadContext } from '../context';
import { WalletButton } from '@/components/WalletButton';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { useAuth } from '@/context/AuthContext';

export function ReadyState() {
  const { state, actions } = useUploadContext();
  const account = useCurrentAccount();
  const { authMode, apiKeyConfigured } = useAuth();
  const { fileInfos, totalSize, selectedHours, customZipName } = state;
  const { setSelectedHours, executeUpload, removeFile, setCustomZipName } = actions;

  if (!fileInfos || fileInfos.length === 0) return null;

  const isAuthorized = !!account || (authMode === 'gasless' && apiKeyConfigured);

  return (
    <>
      {/* File list — neobrutalist panel */}
      <div className="space-y-2">
        {fileInfos.map((info, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-[4px] border-2 border-black bg-muted group hover:bg-background shadow-[2px_2px_0_var(--color-secondary)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)]"
          >
            {isAuthorized ? (
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-[4px] border-2 border-black flex items-center justify-center bg-card text-foreground hover:bg-destructive hover:text-white transition-all shrink-0 cursor-pointer"
                title={`Remove ${info.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <span className="text-xs font-mono text-foreground w-5 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate font-bold uppercase tracking-wide">{info.name}</p>
              <p className="text-xs font-mono text-muted-foreground font-semibold">{formatFileSize(info.size)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-xs px-1 py-2.5 border-t-3 border-black">
        <span className="text-foreground uppercase font-black tracking-wide">
          {fileInfos.length} file{fileInfos.length > 1 ? 's' : ''}
        </span>
        <span className="font-mono font-black text-foreground">{formatFileSize(totalSize)}</span>
      </div>

      {/* Custom ZIP Name input (only for packs) */}
      {fileInfos.length > 1 && (
        <div className="space-y-1.5 my-2">
          <label className="text-xs font-black uppercase tracking-wide text-foreground flex items-center gap-1.5">
            <FolderArchive className="h-3.5 w-3.5 text-secondary" />
            ZIP Bundle Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={customZipName}
              onChange={(e) => setCustomZipName(e.target.value)}
              placeholder="throwit-pack"
              className="w-full h-10 px-3 pr-10 rounded-[4px] border-2 border-black bg-muted text-xs font-mono outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground select-none">
              .zip
            </span>
          </div>
        </div>
      )}

      {/* Expiry */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wide text-foreground flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-secondary" />
          Storage Duration
        </label>
        <Tabs value={String(selectedHours)} onValueChange={(v) => setSelectedHours(Number(v))}>
          <TabsList className="w-full grid grid-cols-4 bg-muted border-3 border-black rounded-[4px] p-1 gap-1 h-auto">
            {EXPIRY_OPTIONS.map((opt: ExpiryOption) => (
              <TabsTrigger
                key={opt.label}
                value={String(opt.hours)}
                className="text-xs font-black uppercase tracking-wider text-muted-foreground py-2 hover:bg-secondary/20 hover:text-foreground data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0_var(--color-secondary)] rounded-[4px] border-2 border-transparent transition-all outline-none cursor-pointer"
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isAuthorized ? (
          <button
            onClick={executeUpload}
            className="w-full text-sm font-black uppercase tracking-wider py-3 rounded-[4px] border-3 border-black bg-primary text-primary-foreground shadow-[4px_4px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] transition-all duration-100 cursor-pointer"
          >
            Encrypt & Upload {fileInfos.length > 1 ? `(${fileInfos.length} FILES)` : ''}
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-[4px] border-3 border-black bg-muted shadow-[4px_4px_0_var(--color-secondary)]">
            <p className="text-xs font-mono text-foreground font-bold text-center">
              Connect a wallet to upload
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

