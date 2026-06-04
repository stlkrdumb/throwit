'use client';

import { useFileUpload, UploadedFileMeta } from '@/hooks/useFileUpload';
import { UploadContext } from './context';
import type { UploadState, UploadActions, UploadMeta } from './context';

interface UploadProviderProps {
  children: React.ReactNode;
  onSave?: (upload: UploadedFileMeta) => void;
}

export function UploadProvider({ children, onSave }: UploadProviderProps) {
  const {
    fileInfo,
    step,
    selectedHours,
    setSelectedHours,
    shareLink,
    progress,
    progressMessage,
    error,
    errorType,
    copied,
    setCopied,
    executeUpload,
    retryUpload,
    handleCopy,
    resetUpload,
    getRootProps,
    getInputProps,
    isDragActive,
  } = useFileUpload({ onSave });

  const state: UploadState = {
    fileInfo,
    step,
    selectedHours,
    shareLink,
    progress,
    progressMessage,
    error,
    errorType,
    copied,
    isDragActive,
  };

  const actions: UploadActions = {
    setSelectedHours,
    setCopied,
    executeUpload,
    retryUpload,
    handleCopy,
    resetUpload,
  };

  const meta: UploadMeta = {
    getRootProps,
    getInputProps,
  };

  return (
    <UploadContext value={{ state, actions, meta }}>
      {children}
    </UploadContext>
  );
}