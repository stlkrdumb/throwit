'use client';

import { Loader2, Wallet, CloudUpload, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';

type UploadStage = 'encrypting' | 'registering' | 'uploading' | 'certifying' | 'confirming';

function classifyStage(msg: string): UploadStage {
  const m = msg.toLowerCase();
  if (m.includes('encrypt') || m.includes('encoding')) return 'encrypting';
  if (m.includes('registration') || m.includes('indexing')) return 'registering';
  if (m.includes('upload') || m.includes('sliver')) return 'uploading';
  if (m.includes('certification') || m.includes('building')) return 'certifying';
  return 'confirming';
}

function isWalletStep(msg: string): boolean {
  return msg.toLowerCase().includes('waiting for wallet');
}

const stageConfig: Record<UploadStage, { sizeIcon: React.ReactNode; label: string }> = {
  encrypting: {
    sizeIcon: (
      <div className="relative">
        <Loader2 className="h-7 w-7 text-emerald-400 animate-spin" />
      </div>
    ),
    label: 'Processing',
  },
  registering: {
    sizeIcon: (
      <div className="relative">
        <Wallet className="h-7 w-7 text-emerald-400" />
      </div>
    ),
    label: 'Registering',
  },
  uploading: {
    sizeIcon: (
      <div className="relative">
        <CloudUpload className="h-7 w-7 text-emerald-400" />
        <Loader2 className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-emerald-400 animate-spin" />
      </div>
    ),
    label: 'Uploading',
  },
  certifying: {
    sizeIcon: (
      <div className="relative">
        <ShieldCheck className="h-7 w-7 text-emerald-400" />
      </div>
    ),
    label: 'Certifying',
  },
  confirming: {
    sizeIcon: <ShieldCheck className="h-7 w-7 text-emerald-400" />,
    label: 'Confirming',
  },
};

export function LoadingState() {
  const { state } = useUploadContext();
  const { fileInfo, progress, progressMessage } = state;
  const stage = classifyStage(progressMessage);
  const { sizeIcon, label } = stageConfig[stage];
  const awaitingWallet = isWalletStep(progressMessage);

  return (
    <>
      {fileInfo && (
        <FileInfoRow name={fileInfo.name} size={fileInfo.size} variant="default" />
      )}

      {/* Stage indicator */}
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="relative w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          {sizeIcon}
          {awaitingWallet && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 max-w-64">{progressMessage}</p>
          {awaitingWallet && (
            <p className="text-xs text-amber-400/70 mt-1">
              Awaiting approval in wallet
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Overall progress</span>
          <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
      </div>
    </>
  );
}
