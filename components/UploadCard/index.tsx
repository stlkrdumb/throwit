'use client';

import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUploadContext } from './context';
import { UploadProvider } from './provider';
import type { UploadedFileMeta } from '@/hooks/useFileUpload';
import { IdleState } from './states/idle';
import { ReadyState } from './states/ready';
import { LoadingState } from './states/loading';
import { CompleteState } from './states/complete';
import { ErrorState } from './states/error';

function UploadCardHeader() {
  return (
    <div className="px-6 py-4 border-b border-slate-800/60 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
        <Upload className="h-4 w-4 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-sm font-medium text-slate-200">Upload File</h2>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldIcon />
          End-to-end encrypted · stored on Walrus
        </p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UploadCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="p-6 space-y-5">
        {children}
      </div>
    </Card>
  );
}

function UploadBody() {
  const { state } = useUploadContext();
  const { step } = state;

  switch (step) {
    case 'idle': return <IdleState />;
    case 'selected': return <ReadyState />;
    case 'done': return <CompleteState />;
    case 'error': return <ErrorState />;
    default: return null;
  }
}

export function UploadCard({ onSave }: { onSave?: (upload: UploadedFileMeta) => void }) {
  return (
    <UploadProvider onSave={onSave}>
      <UploadView />
    </UploadProvider>
  );
}

function UploadView() {
  const { state } = useUploadContext();
  const { step } = state;

  // During upload, show minimal status — no card chrome.
  if (step === 'encrypting' || step === 'uploading') {
    return <LoadingState />;
  }

  return (
    <UploadCardFrame>
      <UploadCardHeader />
      <UploadBody />
    </UploadCardFrame>
  );
}
