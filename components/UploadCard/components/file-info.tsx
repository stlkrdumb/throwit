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
    default: <FileText className="h-5 w-5 text-foreground" />,
    loading: <Loader2 className="h-5 w-5 text-black animate-spin" />,
    success: <Check className="h-5 w-5 text-white" />,
    error: <X className="h-5 w-5 text-white" />,
  };

  const iconBgMap = {
    default: 'bg-background',
    loading: 'bg-secondary',
    success: 'bg-[#4CAF50]',
    error: 'bg-destructive',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-[4px] border-3 border-black bg-muted shadow-[4px_4px_0_var(--color-secondary)]">
      <div className={`h-10 w-10 rounded-[4px] flex items-center justify-center shrink-0 border-2 border-black ${iconBgMap[variant]}`}>
        {iconMap[variant]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-wider text-foreground truncate">{name}</p>
        <p className="text-[10px] font-mono text-muted-foreground font-semibold mt-0.5">{formatFileSize(size)}</p>
      </div>
      {extra}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="h-7 w-7 rounded-[4px] border-2 border-black bg-card hover:bg-destructive hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-[2px_2px_0_var(--color-secondary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)] text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

