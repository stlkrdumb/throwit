'use client';

import { Upload } from 'lucide-react';
import { useUploadContext } from '../context';

export function IdleState() {
  const { state, meta } = useUploadContext();
  const { isDragActive } = state;
  const { getRootProps, getInputProps } = meta;

  return (
    <div
      {...getRootProps()}
      className={`group relative flex flex-col items-center justify-center rounded-[var(--neo-radius-md)] border-3 border-dashed p-10 transition-all cursor-pointer active:scale-[0.99] ${
        isDragActive
          ? 'border-[var(--neo-cyan)] bg-[var(--neo-cyan)]/5 ring-2 ring-[var(--neo-cyan)]/20'
          : 'border-[var(--neo-text-muted)] hover:border-[var(--neo-pink)] hover:bg-[var(--neo-surface-hover)]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="h-14 w-14 rounded-[var(--neo-radius-md)] bg-slate-800 border-[2px] border-slate-700 group-hover:border-[var(--neo-pink)]/50 transition-all neo-shadow-sm flex items-center justify-center">
          <Upload className="h-6 w-6 text-[var(--neo-text-muted)] group-hover:text-[var(--neo-cyan)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
          </p>
          <p className="text-[10px] font-mono text-[var(--neo-text-muted)] mt-2 max-w-[240px]">
            UP TO 10 FILES · 100 MB EACH · MULTI-FILE AUTO-ZIP
          </p>
        </div>
      </div>
    </div>
  );
}
