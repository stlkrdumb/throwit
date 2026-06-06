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
    fileInfos,
    totalSize,
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
    removeFile,
    getRootProps,
    getInputProps,
    isDragActive,
    customZipName,
    setCustomZipName,
    finalFilename,
  } = useFileUpload({ onSave });

  const state: UploadState = {
    fileInfos,
    totalSize,
    step,
    selectedHours,
    shareLink,
    progress,
    progressMessage,
    error,
    errorType,
    copied,
    isDragActive,
    customZipName,
    finalFilename,
  };

  const actions: UploadActions = {
    setSelectedHours,
    setCopied,
    executeUpload,
    retryUpload,
    handleCopy,
    resetUpload,
    removeFile,
    setCustomZipName,
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