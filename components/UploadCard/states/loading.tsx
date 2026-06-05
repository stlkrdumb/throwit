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

const stageColors: Record<UploadStage, string> = {
  encrypting: 'text-[var(--neo-pink)]',
  registering: 'text-[var(--neo-purple)]',
  uploading: 'text-[var(--neo-cyan)]',
  certifying: 'text-[var(--neo-lime)]',
  confirming: 'text-[var(--neo-amber)]',
};

const stageBg: Record<UploadStage, string> = {
  encrypting: 'bg-[var(--neo-pink)]/15',
  registering: 'bg-[var(--neo-purple)]/15',
  uploading: 'bg-[var(--neo-cyan)]/15',
  certifying: 'bg-[var(--neo-lime)]/15',
  confirming: 'bg-[var(--neo-amber)]/15',
};

const stageIcons: Record<UploadStage, React.ReactNode> = {
  encrypting: <FileLock className={`h-6 w-6 ${stageColors.encrypting}`} />,
  registering: <Wallet className={`h-6 w-6 ${stageColors.registering}`} />,
  uploading: <CloudUpload className={`h-6 w-6 ${stageColors.uploading}`} />,
  certifying: <ShieldCheck className={`h-6 w-6 ${stageColors.certifying}`} />,
  confirming: <CloudCheck className={`h-6 w-6 ${stageColors.confirming}`} />,
};

export function LoadingState() {
  const { state } = useUploadContext();
  const { progress, progressMessage } = state;
  const stage = classifyStage(progressMessage);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      {/* Icon changes per stage */}
      <div className={`h-12 w-12 rounded-[var(--neo-radius-md)] ${stageBg[stage]} border-[2px] border-current ${stageColors[stage]} flex items-center justify-center neo-shadow-sm`}>
        {stageIcons[stage]}
      </div>

      {/* Status text */}
      <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">{progressMessage}</p>

      {/* Progress bar — neobrutalist style */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-slate-800 border-[var(--neo-border-bold)] rounded-sm overflow-hidden">
          <div
            className="h-full bg-[var(--neo-pink)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
