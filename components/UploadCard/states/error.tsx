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

  return (
    <>
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
