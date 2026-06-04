'use client';

import { Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useUploadContext } from './context';
import { UploadProvider } from './provider';
import type { UploadedFileMeta } from '@/hooks/useFileUpload';

/* ──────────────────────────────────────────────
 * UploadCard — compound component
 * Explicit state variants, shared context interface.
 * ────────────────────────────────────────────── */

function UploadCardHeader() {
  const { state } = useUploadContext();
  const { step } = state;

  const iconMap: Record<string, React.ReactNode> = {
    idle: <Upload className="h-4 w-4 text-emerald-400" />,
    selected: <Upload className="h-4 w-4 text-emerald-400" />,
    encrypting: <Upload className="h-4 w-4 text-emerald-400" />,
    uploading: <Upload className="h-4 w-4 text-emerald-400" />,
    done: <Check className="h-4 w-4 text-emerald-400" />,
    error: <AlertCircle className="h-4 w-4 text-red-400" />,
  };

  const statusBadgeMap: Record<string, React.ReactNode> = {
    idle: null,
    selected: null,
    encrypting: <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />,
    uploading: <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin" />,
    done: (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <Check className="h-3 w-3" /> Done
      </span>
    ),
    error: (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
        Failed
      </span>
    ),
  };

  return (
    <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
          {iconMap[step] ?? <Upload className="h-4 w-4 text-emerald-400" />}
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-200">Upload File</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldIcon />
            End-to-end encrypted · stored on Walrus
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-medium">
        {statusBadgeMap[step] ?? null}
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
import { LoadingState } from './states/loading';
import { CompleteState } from './states/complete';
import { ErrorState } from './states/error';

function UploadCardBody() {
  const { state } = useUploadContext();
  const { step } = state;

  // Each state is an explicit variant — no boolean prop proliferation
  switch (step) {
    case 'idle':
      return <IdleState />;
    case 'selected':
      return <ReadyState />;
    case 'encrypting':
    case 'uploading':
      return <LoadingState />;
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
      <UploadCardFrame>
        <UploadCardHeader />
        <UploadCardBody />
      </UploadCardFrame>
    </UploadProvider>
  );
}
