'use client';

import { Shield } from 'lucide-react';
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



const stageConfig: Record<UploadStage, { icon: React.ReactNode; label: string }> = {
  encrypting: { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Encrypting' },
  registering: { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Registering' },
  uploading: { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Uploading' },
  certifying: { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Certifying' },
  confirming: { icon: <Shield className="h-5 w-5 text-emerald-400" />, label: 'Confirming' },
};

export function LoadingState() {
  const { state } = useUploadContext();
  const { fileInfo, progress, progressMessage } = state;
  const stage = classifyStage(progressMessage);
  const { icon, label } = stageConfig[stage];
  const awaitingWallet = isWalletStep(progressMessage);

  return (
    <>
      {fileInfo && (
        <FileInfoRow name={fileInfo.name} size={fileInfo.size} variant="default" />
      )}

      {/* Stage indicator — no animation, just the icon and label */}
      <div className="flex items-center justify-center gap-3 py-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          {icon}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5 max-w-64">{progressMessage}</p>
          {awaitingWallet && (
            <p className="text-[10px] font-medium text-amber-400/70 mt-1.5 uppercase tracking-wide">
              Waiting for your approval
            </p>
          )}
        </div>
      </div>

      {/* Progress — the only animated element during upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Uploading</span>
          <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
      </div>
    </>
  );
}
