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
    default: <FileText className="h-5 w-5 text-[var(--neo-text-muted)]" />,
    loading: <Loader2 className="h-5 w-5 text-[var(--neo-pink)] animate-spin" />,
    success: <Check className="h-5 w-5 text-[var(--neo-lime)]" />,
    error: <X className="h-5 w-5 text-[var(--neo-red)]" />,
  };

  const borderMap = {
    default: 'border-[2px] border-slate-800',
    loading: 'border-[2px] border-[var(--neo-pink)]/30',
    success: 'border-[2px] border-[var(--neo-lime)]/30',
    error: 'border-[2px] border-[var(--neo-red)]',
  };

  const bgMap = {
    default: 'bg-[var(--neo-page-bg)]',
    loading: 'bg-[var(--neo-pink)]/10',
    success: 'bg-[var(--neo-lime)]/10',
    error: 'bg-[var(--neo-red)]/10',
  };

  const iconBgMap = {
    default: 'bg-slate-800 border-slate-700',
    loading: 'bg-[var(--neo-pink)]/20 border-[var(--neo-pink)]',
    success: 'bg-[var(--neo-lime)]/20 border-[var(--neo-lime)]',
    error: 'bg-[var(--neo-red)]/20 border-[var(--neo-red)]',
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-[var(--neo-radius-md)] ${borderMap[variant]} ${bgMap[variant]} neo-shadow-sm`}>
      <div className={`h-10 w-10 rounded-[var(--neo-radius-sm)] flex items-center justify-center shrink-0 border-2 ${iconBgMap[variant]}`}>
        {iconMap[variant]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--neo-text-primary)] truncate">{name}</p>
        <p className="text-[10px] font-mono text-[var(--neo-text-muted)] mt-0.5">{formatFileSize(size)}</p>
      </div>
      {extra}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="h-7 w-7 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 hover:bg-[var(--neo-red)]/20 flex items-center justify-center shrink-0 active:scale-95 transition-all neo-button-like"
        >
          <X className="h-4 w-4 text-[var(--neo-text-muted)]" />
        </button>
      )}
    </div>
  );
}
