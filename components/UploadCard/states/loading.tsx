'use client';

import { Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadContext } from '../context';

export function LoadingState() {
  const { state } = useUploadContext();
  const { progress, progressMessage } = state;

  return (
    <div className="flex flex-col items-center gap-3 py-10">
      {/* Pulsing shield icon */}
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
          <Shield className="h-6 w-6 text-emerald-400" />
        </div>
      </div>

      {/* Medium status text */}
      <p className="text-sm font-medium text-slate-200">{progressMessage}</p>

      {/* Thin progress bar */}
      <div className="w-full max-w-xs">
        <Progress value={progress} className="h-1 bg-slate-800" />
      </div>
    </div>
  );
}
