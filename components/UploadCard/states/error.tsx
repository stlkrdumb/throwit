'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';
import { RecoveryPanel } from '../components/recovery-panel';

export function ErrorState() {
  const { state, actions } = useUploadContext();
  const { fileInfo, error, errorType } = state;
  const { retryUpload, resetUpload } = actions;

  if (!error) return null;

  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20 shrink-0">
          <AlertCircle className="h-4 w-4 text-red-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-slate-200">Upload Failed</h2>
          <p className="text-xs text-slate-500">Something went wrong — you can retry or start over</p>
        </div>
      </div>

      {fileInfo && (
        <FileInfoRow name={fileInfo.name} size={fileInfo.size} variant="error" />
      )}

      {error && (
        <>
          <Alert variant="destructive" className="border-red-900/40 bg-red-950/20 text-red-400 text-xs">
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
