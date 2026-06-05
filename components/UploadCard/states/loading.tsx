'use client';

import { FileLock, Wallet, CloudUpload, ShieldCheck, CloudCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadContext } from '../context';

type UploadStage = 'encrypting' | 'registering' | 'uploading' | 'certifying' | 'confirming';

function classifyStage(msg: string): UploadStage {
  const m = msg.toLowerCase();
  if (m.includes('encrypt') || m.includes('encoding')) return 'encrypting';
  if (m.includes('registration') || m.includes('indexing')) return 'registering';
  if (m.includes('upload') || m.includes('sliver')) return 'uploading';
  if (m.includes('certification') || m.includes('building')) return 'certifying';
  return 'confirming';
}

const stageIcons: Record<UploadStage, React.ReactNode> = {
  encrypting: <FileLock className="h-6 w-6 text-emerald-400" />,
  registering: <Wallet className="h-6 w-6 text-emerald-400" />,
  uploading: <CloudUpload className="h-6 w-6 text-emerald-400" />,
  certifying: <Wallet className="h-6 w-6 text-emerald-400" />,
  confirming: <CloudCheck className="h-6 w-6 text-emerald-400" />,
};

export function LoadingState() {
  const { state } = useUploadContext();
  const { progress, progressMessage } = state;
  const stage = classifyStage(progressMessage);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      {/* Icon changes per stage — no animation */}
      <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
        {stageIcons[stage]}
      </div>

      {/* Status text */}
      <p className="text-sm font-medium text-slate-200">{progressMessage}</p>

      {/* Progress bar — only animated element */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
