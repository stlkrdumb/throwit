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
      className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-200 cursor-pointer active:scale-[0.99] ${
        isDragActive
          ? 'border-emerald-500/60 bg-emerald-500/5 ring-2 ring-emerald-500/20'
          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/20'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="h-14 w-14 rounded-full bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700/50 group-hover:ring-slate-600/50 transition-all">
          <Upload className="h-6 w-6 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
            Up to 10 files, 100 MB each. Multi-file uploads auto-ZIP.
          </p>
        </div>
      </div>
    </div>
  );
}
