'use client';

import { Upload } from 'lucide-react';
import { useUploadContext } from '../context';

export function IdleState() {
  const { state, actions, meta } = useUploadContext();
  const { isDragActive } = state;
  const { getRootProps, getInputProps } = meta;

  return (
    <div
      {...getRootProps()}
      className={`group relative flex flex-col items-center justify-center rounded-[4px] border-4 border-dashed p-10 transition-all cursor-pointer border-black ${
        isDragActive
          ? 'bg-secondary shadow-[4px_4px_0_var(--color-secondary)] translate-x-[-2px] translate-y-[-2px]'
          : 'bg-muted hover:bg-background hover:shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px]'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="h-14 w-14 rounded-[4px] bg-card border-3 border-black group-hover:bg-primary transition-all duration-100 shadow-[2px_2px_0_var(--color-secondary)] flex items-center justify-center text-foreground group-hover:text-black">
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-wider text-foreground">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
          </p>
          <p className="text-xs font-mono text-muted-foreground font-semibold mt-2 max-w-[240px] tracking-wide">
            Up to 10 files · 100 MB each · Multi-file auto-ZIP
          </p>
        </div>
      </div>
    </div>
  );
}

