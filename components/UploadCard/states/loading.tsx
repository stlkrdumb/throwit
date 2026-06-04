'use client';

import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';

export function LoadingState() {
  const { state } = useUploadContext();
  const { fileInfo, progress, progressMessage } = state;

  return (
    <>
      {fileInfo && (
        <FileInfoRow name={fileInfo.name} size={fileInfo.size} variant="loading" />
      )}

      <div className="flex flex-col items-center gap-2 py-4">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-medium text-slate-300">{progressMessage}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
      </div>
    </>
  );
}
