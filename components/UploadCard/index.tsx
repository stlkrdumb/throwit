'use client';

import { Upload, ShieldCheck } from 'lucide-react';
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
    <div className="px-4 py-4 border-b-[var(--neo-border-bold)] flex items-center gap-3 bg-[var(--neo-surface-hover)]">
      <div className="h-9 w-9 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)]/15 border-[2px] border-[var(--neo-pink)] flex items-center justify-center shrink-0 neo-shadow-sm">
        <Upload className="h-4.5 w-4.5 text-[var(--neo-pink)]" style={{ fontSize: '18px' }} />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight uppercase text-[var(--neo-text-primary)]">Upload File</h2>
        <p className="text-[10px] font-mono text-[var(--neo-text-muted)] flex items-center gap-1.5 mt-0.5">
          <ShieldCheck className="h-3 w-3 text-[var(--neo-lime)]" />
          E2E encrypted · stored on Walrus
        </p>
      </div>
    </div>
  );
}

function UploadCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-[var(--neo-border-thick)] bg-[var(--neo-surface)] shadow-md rounded-[var(--neo-radius-md)] overflow-hidden">
      <div className="p-5 space-y-5">
        {children}
      </div>
    </Card>
  );
}

function UploadBody() {
  const { state } = useUploadContext();
  const { step, fileInfos } = state;

  // During selection: show both drop zone and file list (multi-file support)
  if (step === 'selected' && fileInfos.length > 0) {
    return (
      <>
        <IdleState />
        <ReadyState />
      </>
    );
  }

  switch (step) {
    case 'idle': return <IdleState />;
    case 'done': return <CompleteState />;
    case 'error': return <ErrorState />;
    default: return null;
  }
}

function UploadHeaderOnly() {
  const { state } = useUploadContext();
  return <UploadCardHeader />;
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

  // Complete / Error have their own headers — render frame + body only.
  if (step === 'done' || step === 'error') {
    return <UploadCardFrame>{<UploadBody />}</UploadCardFrame>;
  }

  // Idle / Selected use the shared static header.
  return (
    <UploadCardFrame>
      <UploadHeaderOnly />
      <UploadBody />
    </UploadCardFrame>
  );
}
