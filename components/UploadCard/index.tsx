'use client';

import { Upload, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUploadContext } from './context';
import { UploadProvider } from './provider';
import type { UploadedFileMeta } from '@/hooks/useFileUpload';

/* ──────────────────────────────────────────────
 * UploadCard — compound component
 * Explicit state variants, shared context interface.
 * ────────────────────────────────────────────── */

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
  // Inline to avoid importing just for the icon
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
 * Body — renders the correct state variant
 * Based on Vercel pattern: explicit variant components
 * instead of internal booleans.
 * ────────────────────────────────────────────── */

import { IdleState } from './states/idle';
import { ReadyState } from './states/ready';
import { CompleteState } from './states/complete';
import { ErrorState } from './states/error';

function UploadCardBody() {
  const { state } = useUploadContext();
  const { step } = state;

  // Uploading handled inline in UploadCardContent (no card chrome).
  switch (step) {
    case 'idle':
      return <IdleState />;
    case 'selected':
      return <ReadyState />;
    case 'done':
      return <CompleteState />;
    case 'error':
      return <ErrorState />;
    default:
      return <IdleState />;
  }
}

/* ──────────────────────────────────────────────
 * Compound component for consumer convenience
 * ────────────────────────────────────────────── */

function UploadCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="p-6 space-y-5">
        {children}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────
 * Public API
 * ────────────────────────────────────────────── */

export {
  UploadCardFrame as Frame,
  UploadCardHeader as Header,
  UploadCardBody as Body,
};

/* ──────────────────────────────────────────────
 * Ready-to-use UploadCard component
 * This is the common case — a complete card with all states.
 * Consumers who need to customize can compose Header/Frame/Body themselves.
 * ────────────────────────────────────────────── */

export function UploadCard({ onSave }: { onSave?: (upload: UploadedFileMeta) => void }) {
  return (
    <UploadProvider onSave={onSave}>
      <UploadCardContent />
    </UploadProvider>
  );
}

function UploadCardContent() {
  const { state } = useUploadContext();
  const { step } = state;

  if (step === 'encrypting' || step === 'uploading') {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 py-8">
        {/* Pulsing shield icon */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        {/* Status text */}
        <p className="text-sm font-medium text-slate-200">{state.progressMessage}</p>

        {/* Progress bar — visible track + thin fill */}
        <div className="w-full max-w-xs">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UploadCardFrame>
      <UploadCardHeader />
      <UploadCardBody />
    </UploadCardFrame>
  );
}
