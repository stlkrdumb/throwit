'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';
import { RecoveryPanel } from '../components/recovery-panel';

export function ErrorState() {
  const { state, actions } = useUploadContext();
  const { fileInfos, error, errorType } = state;
  const { retryUpload, resetUpload } = actions;

  if (!error) return null;

  return (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b-[var(--neo-border-bold)] flex items-center gap-3 bg-[var(--neo-red)]/10">
        <div className="h-9 w-9 rounded-[var(--neo-radius-md)] bg-[var(--neo-red)]/25 border-[2px] border-[var(--neo-red)] flex items-center justify-center shrink-0 neo-shadow-sm">
          <AlertCircle className="h-4.5 w-4.5 text-[var(--neo-red)]" style={{ fontSize: '18px' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold uppercase tracking-tight text-[var(--neo-text-primary)]">Upload Failed</h2>
          <p className="text-[10px] font-mono text-[var(--neo-text-muted)]">SOMETHING WENT WRONG — YOU CAN RETRY OR START OVER</p>
        </div>
      </div>

      {fileInfos.length > 0 && (
        <FileInfoRow name={fileInfos[0].name} size={fileInfos[0].size} variant="error" />
      )}

      {error && (
        <>
          <Alert variant="destructive" className="border-[3px] border-[var(--neo-red)] bg-[var(--neo-red)]/10 text-[var(--neo-red)] font-mono text-xs rounded-[var(--neo-radius-sm)]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <RecoveryPanel
            errorType={errorType}
            errorMessage={error}
            onRetry={retryUpload}
            onReset={resetUpload}
          />
        </>
      )}
    </>
  );
}
