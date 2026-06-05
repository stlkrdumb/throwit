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
      <div className="px-4 py-4 border-b-3 border-black flex items-center gap-3 bg-destructive">
        <div className="h-9 w-9 rounded-[4px] bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000]">
          <AlertCircle className="h-4.5 w-4.5 text-black" style={{ fontSize: '18px' }} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-black">Upload Failed</h2>
          <p className="text-[10px] font-mono text-black font-bold">SOMETHING WENT WRONG — YOU CAN RETRY OR START OVER</p>
        </div>
      </div>

      {fileInfos.length > 0 && (
        <FileInfoRow name={fileInfos[0].name} size={fileInfos[0].size} variant="error" />
      )}

      {error && (
        <>
          <Alert className="border-3 border-black bg-card text-foreground font-mono text-xs rounded-[4px] shadow-[4px_4px_0_#FF5252] p-4 flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <AlertDescription className="font-mono text-xs font-bold uppercase text-foreground">{error}</AlertDescription>
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

