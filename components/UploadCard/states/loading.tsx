'use client';

import { FileLock, Wallet, CloudUpload, ShieldCheck, CloudCheck } from 'lucide-react';
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

const stageBg: Record<UploadStage, string> = {
  encrypting: 'bg-primary text-primary-foreground',
  registering: 'bg-[#9C27B0] text-white',
  uploading: 'bg-accent text-black',
  certifying: 'bg-[#4CAF50] text-white',
  confirming: 'bg-secondary text-black',
};

const stageIcons: Record<UploadStage, React.ReactNode> = {
  encrypting: <FileLock className="h-6 w-6" />,
  registering: <Wallet className="h-6 w-6" />,
  uploading: <CloudUpload className="h-6 w-6" />,
  certifying: <ShieldCheck className="h-6 w-6" />,
  confirming: <CloudCheck className="h-6 w-6" />,
};

export function LoadingState() {
  const { state } = useUploadContext();
  const { progress, progressMessage } = state;
  const stage = classifyStage(progressMessage);

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      {/* Icon changes per stage */}
      <div className={`h-12 w-12 rounded-[4px] ${stageBg[stage]} border-3 border-black flex items-center justify-center shadow-[3px_3px_0_var(--color-secondary)]`}>
        {stageIcons[stage]}
      </div>

      {/* Status text */}
      <p className="text-sm font-black uppercase tracking-wider text-foreground mt-2 text-center">{progressMessage}</p>

      {/* Progress bar — neobrutalist style */}
      <div className="w-full max-w-xs mt-2">
        <div className="h-6 bg-muted border-3 border-black rounded-[4px] overflow-hidden relative shadow-[3px_3px_0_var(--color-secondary)]">
          <div
            className="h-full bg-secondary border-r-3 border-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-black text-foreground mix-blend-difference">
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
}

