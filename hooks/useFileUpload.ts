'use client';

import { useCallback, useRef, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  useDAppKit,
  useCurrentAccount,
  useCurrentClient,
} from '@mysten/dapp-kit-react';
import { toast } from 'sonner';
import { generateKey, encryptFile, exportKey } from '@/lib/crypto';
import { getWalrusWriteClient } from '@/lib/walrus';
import { config } from '@/lib/config';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const EXPIRY_OPTIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '3 Hours', hours: 3 },
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
] as const;

export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

function hoursToEpochs(hours: number): number {
  if (hours <= 24) return 1;
  return Math.ceil(hours / 24);
}

export type UploadStep = 'idle' | 'selected' | 'encrypting' | 'uploading' | 'done' | 'error';

export type UploadErrorType =
  | 'wallet-rejected'
  | 'network-timeout'
  | 'insufficient-funds'
  | 'blob-encoding'
  | 'unknown';

export interface UploadedFileMeta {
  blobId: string;
  blobObjectId: string;
  filename: string;
  size: number;
  uploadedAt: number;
  keyB64: string;
  ivB64: string;
}

export interface UseFileUploadOptions {
  /** Called when upload completes successfully. Defaults to localStorage + event dispatch. */
  onSave?: (upload: UploadedFileMeta) => void;
  /** Fired when a new upload entry is saved, for external UI sync. */
  onNotifySuccess?: () => void;
}

/** Result returned from executeUpload — component uses this to build the share link. */
export interface UploadResult {
  meta: UploadedFileMeta;
  blobId: string;
}

export interface UseFileUploadReturn {
  // File selection state
  fileRef: React.MutableRefObject<File | null>;
  fileInfo: { name: string; size: number } | null;

  // Upload step
  step: UploadStep;
  setStep: React.Dispatch<React.SetStateAction<UploadStep>>;

  // UI state
  selectedHours: number;
  setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
  shareLink: string | null;
  progress: number;
  progressMessage: string;
  error: string | null;
  /** Classifies the error to show targeted recovery UI. */
  errorType: UploadErrorType;
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;

  // Dropzone integration
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;

  /** Execute the full upload pipeline. Resolves when upload completes and sets shareLink internally. */
  executeUpload: () => Promise<void>;

  /** Retry from scratch (clears error, resets progress). */
  retryUpload: () => Promise<void>;

  /** Copy current share link to clipboard. */
  handleCopy: () => void;

  /** Reset everything to initial state. */
  resetUpload: () => void;
}

/**
 * Custom hook that encapsulates all upload business logic:
 * file selection → encrypt → encode → register on-chain → upload slivers → certify → save metadata.
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSave, onNotifySuccess } = options;

  const dAppKit = useDAppKit();
  const account = useCurrentAccount();
  const suiClient = useCurrentClient();

  const fileRef = useRef<File | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [selectedHours, setSelectedHours] = useState(3);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<UploadErrorType>('unknown');
  const [copied, setCopied] = useState(false);

  // --- Dropzone setup ---
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setError('File too large or unsupported. Max 100 MB.');
      return;
    }
    const f = acceptedFiles[0];
    if (!f) return;
    fileRef.current = f;
    setFileInfo({ name: f.name, size: f.size });
    setShareLink(null);
    setStep('selected');
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.bin', '.zip', '.png', '.jpg', '.gif', '.pdf', '.mp4', '.docx'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDropAccepted: () => setError(null),
  });

  // --- Core upload logic ---
  const executeUpload = useCallback(async (): Promise<void> => {
    if (!fileInfo || !fileRef.current) throw new Error('No file selected');
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setStep('encrypting');
    setError(null);
    setProgress(0);
    setProgressMessage('Encrypting file locally…');

    try {
      // Step 1: Generate key + encrypt file
      const key = await generateKey();
      const { ciphertext, iv } = await encryptFile(fileRef.current, key);
      const keyB64 = await exportKey(key);
      const ivB64 = btoa(String.fromCharCode(...iv))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      setProgress(15);
      setProgressMessage('Encoding blob client-side…');
      setStep('uploading');

      // Step 2: Initialize Walrus Write Flow and encode blob
      const client = getWalrusWriteClient();
      const flow = client.writeBlobFlow({ blob: ciphertext });
      const encoded = await flow.encode();
      const blobId = encoded.blobId;

      setProgress(30);
      setProgressMessage('Building registration transaction…');

      // Step 3: Register blob on-chain using the user's wallet
      const epochs = hoursToEpochs(selectedHours);
      const registerTx = flow.register({
        epochs,
        deletable: true,
        owner: account.address,
      });

      setProgress(45);
      setProgressMessage('Waiting for wallet approval (Registration)…');
      toast.info('Please approve the registration transaction in your wallet…');

      const registerResult = await dAppKit.signAndExecuteTransaction({
        transaction: registerTx,
      });

      if (registerResult.FailedTransaction) {
        throw new Error(
          registerResult.FailedTransaction.status.error?.message ??
            'Registration transaction failed in wallet'
        );
      }

      const registerDigest = registerResult.Transaction.digest;
      setProgressMessage('Waiting for registration transaction indexing…');
      await suiClient!.waitForTransaction({ digest: registerDigest });

      setProgress(60);
      setProgressMessage('Uploading file slivers to Walrus nodes…');

      // Step 4: Upload encoded slivers to storage nodes
      await flow.upload({ digest: registerDigest });

      setProgress(75);
      setProgressMessage('Building certification transaction…');

      // Step 5: Certify blob on-chain using the user's wallet
      const certifyTx = flow.certify();
      setProgressMessage('Waiting for wallet approval (Certification)…');
      toast.info('Please approve the certification transaction in your wallet…');

      const certifyResult = await dAppKit.signAndExecuteTransaction({
        transaction: certifyTx,
      });

      if (certifyResult.FailedTransaction) {
        throw new Error(
          certifyResult.FailedTransaction.status.error?.message ??
            'Certification transaction failed in wallet'
        );
      }

      const certifyDigest = certifyResult.Transaction.digest;
      setProgressMessage('Waiting for certification transaction indexing…');
      await suiClient!.waitForTransaction({ digest: certifyDigest });

      setProgress(95);
      setProgressMessage('Confirming blob on-chain…');
      const certifiedBlob = await flow.getBlob();
      const blobObjectId = certifiedBlob.blobObjectId;

      setProgress(100);
      setProgressMessage('Upload complete!');

      // Save upload metadata to local storage for the dashboard
      const newUpload: UploadedFileMeta = {
        blobId,
        blobObjectId,
        filename: fileInfo.name,
        size: fileInfo.size,
        uploadedAt: Date.now(),
        keyB64,
        ivB64,
      };

      if (onSave) {
        onSave(newUpload);
      } else {
        // Default: save to localStorage
        const storageKey = `throwit_uploads_${account.address}`;
        const existing = localStorage.getItem(storageKey);
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newUpload);
        localStorage.setItem(storageKey, JSON.stringify(list));
      }

      // Notify uploads dashboard to update
      if (onNotifySuccess) {
        onNotifySuccess();
      } else {
        window.dispatchEvent(new Event('throwit_upload_success'));
      }

      // Build share link from config + results
      const link = `${config.appUrl}/d/${blobId}#${keyB64}.${ivB64}.${encodeURIComponent(fileInfo.name)}`;
      setShareLink(link);
      setStep('done');
      toast.success('File uploaded and encrypted!');
    } catch (err) {
      console.error('Upload error:', err);
      const classified = classifyError(err);
      setError(
        err instanceof Error
          ? err.message
          : `Upload failed. Make sure your wallet is on Sui ${config.network} and has SUI.`
      );
      setErrorType(classified);
      setStep('error');
    }
  }, [account, dAppKit, fileInfo, options, selectedHours, suiClient]);

  // --- Retry: clear error + type, reset progress, re-execute ---
  const retryUpload = useCallback(async () => {
    setError(null);
    setErrorType('unknown');
    setProgress(0);
    setProgressMessage('');
    await executeUpload();
  }, [executeUpload]);

  // --- Copy share link ---
  const handleCopy = useCallback(() => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);

  // --- Reset everything ---
  const resetUpload = useCallback(() => {
    fileRef.current = null;
    setStep('idle');
    setFileInfo(null);
    setShareLink(null);
    setError(null);
    setErrorType('unknown');
    setProgress(0);
    setProgressMessage('');
    setCopied(false);
  }, []);

  return {
    fileRef,
    fileInfo,
    step,
    setStep,
    selectedHours,
    setSelectedHours,
    shareLink,
    progress,
    progressMessage,
    error,
    errorType,
    copied,
    setCopied,
    getRootProps,
    getInputProps,
    isDragActive,
    executeUpload,
    retryUpload,
    handleCopy,
    resetUpload,
  };
}

/**
 * Classify an upload error to drive targeted recovery messaging.
 */
function classifyError(err: unknown): UploadErrorType {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    // Wallet explicitly rejected the transaction
    if (
      msg.includes('rejected') ||
      msg.includes('user cancelled') ||
      msg.includes('denied') ||
      msg.includes('transaction rejected')
    ) {
      return 'wallet-rejected';
    }

    // Transaction failed due to insufficient funds or gas issues
    if (
      msg.includes('insufficient') ||
      msg.includes('not enough') ||
      msg.includes('balance') ||
      msg.includes('gas') ||
      msg.includes('fee') ||
      msg.includes('overdraft')
    ) {
      return 'insufficient-funds';
    }

    // Network / RPC timeout or unreachable node
    if (
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('connection refused') ||
      msg.includes('fetch failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('service unavailable') ||
      msg.includes('503')
    ) {
      return 'network-timeout';
    }

    // Walrus blob encoding issues (e.g. blob too large, invalid format)
    if (
      msg.includes('encode') ||
      msg.includes('blob') ||
      msg.includes('invalid size') ||
      msg.includes('too large') ||
      msg.includes('validation')
    ) {
      return 'blob-encoding';
    }
  }

  return 'unknown';
}
