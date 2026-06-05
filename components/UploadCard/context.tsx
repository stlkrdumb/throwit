import { createContext, use } from 'react';
import type { UploadErrorType, ExpiryOption } from '@/hooks/useFileUpload';

/* ──────────────────────────────────────────────
 * Generic context interface (Vercel pattern)
 * state / actions / meta — dependency-injectable
 * ────────────────────────────────────────────── */

export interface UploadState {
  fileInfos: { name: string; size: number }[];
  totalSize: number;
  step: 'idle' | 'selected' | 'encrypting' | 'uploading' | 'done' | 'error';
  selectedHours: number;
  shareLink: string | null;
  progress: number;
  progressMessage: string;
  error: string | null;
  errorType: UploadErrorType;
  copied: boolean;
  isDragActive: boolean;
}

export interface UploadActions {
  setSelectedHours: (hours: number) => void;
  setCopied: (copied: boolean) => void;
  executeUpload: () => void;
  retryUpload: () => void;
  handleCopy: () => void;
  resetUpload: () => void;
  removeFile: (index: number) => void;
}

export interface UploadMeta {
  getRootProps: () => React.HTMLAttributes<HTMLElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
}

export interface UploadContextValue {
  state: UploadState;
  actions: UploadActions;
  meta: UploadMeta;
}

export const UploadContext = createContext<UploadContextValue | null>(null);

export function useUploadContext() {
  const ctx = use(UploadContext);
  if (!ctx) throw new Error('useUploadContext must be used within <UploadProvider>');
  return ctx;
}
