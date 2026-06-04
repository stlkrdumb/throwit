'use client';

import { FileText, Loader2, X, Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatFileSize } from '@/hooks/useFileUpload';

interface FileInfoRowProps {
  name: string;
  size: number;
  /** 'default' | 'loading' | 'success' | 'error' */
  variant?: 'default' | 'loading' | 'success' | 'error';
  onRemove?: () => void;
  extra?: ReactNode;
}

export function FileInfoRow({ name, size, variant = 'default', onRemove, extra }: FileInfoRowProps) {
  const iconMap = {
    default: <FileText className="h-5 w-5 text-slate-400" />,
    loading: <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />,
    success: <Check className="h-5 w-5 text-emerald-400" />,
    error: <X className="h-5 w-5 text-red-400" />,
  };

  const borderMap = {
    default: 'border-slate-800',
    loading: 'border-emerald-900/30',
    success: 'border-emerald-900/30',
    error: 'border-red-800/40',
  };

  const bgMap = {
    default: 'bg-slate-950/40',
    loading: 'bg-emerald-950/10',
    success: 'bg-emerald-950/10',
    error: 'bg-red-950/10',
  };

  const iconBgMap = {
    default: 'bg-slate-800 ring-slate-700/50',
    loading: 'bg-emerald-500/10 ring-emerald-500/20',
    success: 'bg-emerald-500/10 ring-emerald-500/20',
    error: 'bg-red-500/10 ring-red-500/20',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${borderMap[variant]} ${bgMap[variant]}`}>
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ring-1 ${iconBgMap[variant]}`}>
        {iconMap[variant]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(size)}</p>
      </div>
      {extra}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}
