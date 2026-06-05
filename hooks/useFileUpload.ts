'use client';

import { useCallback, useRef, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import JSZip from 'jszip';
import {
  useDAppKit,
  useCurrentAccount,
  useCurrentClient,
} from '@mysten/dapp-kit-react';
import { toast } from 'sonner';
import { generateKey, encryptFile, exportKey } from '@/lib/crypto';
import { getWalrusWriteClient } from '@/lib/walrus';
import { config } from '@/lib/config';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB per file
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500 MB total

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

// File selected for upload with encryption progress
interface SelectedFile {
  file: File;
  encrypted?: { ciphertext: Uint8Array; iv: Uint8Array };
  keyB64?: string;
  ivB64?: string;
}

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

export interface UseFileUploadReturn {
  // File selection state
  fileInfos: { name: string; size: number }[];
  totalSize: number;
  fileCount: number;
  singleFile: File | null;

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
  errorType: UploadErrorType;
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;

  // Dropzone integration
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;

  executeUpload: () => Promise<void>;
  retryUpload: () => Promise<void>;
  handleCopy: () => void;
  resetUpload: () => void;
  removeFile: (index: number) => void;
}

/**
 * Custom hook with multi-file support:
 * files → encrypt each → pack into ZIP if >1 → upload to Walrus → share link.
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSave, onNotifySuccess } = options;

  const dAppKit = useDAppKit();
  const account = useCurrentAccount();
  const suiClient = useCurrentClient();

  const filesRef = useRef<SelectedFile[]>([]);
  const [step, setStep] = useState<UploadStep>('idle');
  const [fileInfos, setFileInfos] = useState<{ name: string; size: number }[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [selectedHours, setSelectedHours] = useState(3);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<UploadErrorType>('unknown');
  const [copied, setCopied] = useState(false);

  // --- Dropzone ---
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      setError('File too large or unsupported. Max 100 MB per file.');
      return;
    }
    if (acceptedFiles.length === 0) return;

    const total = acceptedFiles.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_TOTAL_SIZE) {
      setError(`Too much data. Max ${formatFileSize(MAX_TOTAL_SIZE)} total.`);
      return;
    }

    const selected: SelectedFile[] = acceptedFiles.map((f) => ({ file: f, progress: 0 }));
    filesRef.current = selected;
    setFileInfos(selected.map((s) => ({ name: s.file.name, size: s.file.size })));
    setTotalSize(total);
    setSingleFile(acceptedFiles.length === 1 ? acceptedFiles[0] : null);
    setShareLink(null);
    setStep('selected');
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.bin', '.zip', '.png', '.jpg', '.gif', '.pdf', '.mp4', '.docx'] },
    maxFiles: 10,
    maxSize: MAX_FILE_SIZE,
    onDropAccepted: () => setError(null),
  });

  const removeFile = useCallback((index: number) => {
    const newFiles = filesRef.current.filter((_, i) => i !== index);
    const newInfos = fileInfos.filter((_, i) => i !== index);
    if (newFiles.length === 0) {
      resetUpload();
      return;
    }
    filesRef.current = newFiles;
    setFileInfos(newInfos);
    setTotalSize(newFiles.reduce((s, f) => s + f.file.size, 0));
    setSingleFile(newFiles.length === 1 ? newFiles[0].file : null);
  }, [fileInfos]);

  // --- Core upload ---
  const executeUpload = useCallback(async (): Promise<void> => {
    if (filesRef.current.length === 0) throw new Error('No files selected');
    if (!account) { toast.error('Connect your wallet first'); return; }

    setStep('encrypting');
    setError(null);
    setProgress(0);
    const isSingle = filesRef.current.length === 1;
    setProgressMessage(isSingle ? 'Encrypting file…' : `Encrypting ${filesRef.current.length} files…`);

    try {
      // Step 1: Encrypt each file individually
      for (let i = 0; i < filesRef.current.length; i++) {
        const f = filesRef.current[i];
        const key = await generateKey();
        const { ciphertext, iv } = await encryptFile(f.file, key);
        const keyB64 = await exportKey(key);
        const ivB64 = btoa(String.fromCharCode(...iv))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        filesRef.current[i] = { ...f, encrypted: { ciphertext, iv }, keyB64, ivB64 };
        setProgress(Math.round(((i + 1) / filesRef.current.length) * 25));
        setProgressMessage(`Encrypted ${i + 1}/${filesRef.current.length}…`);
      }

      // Step 2: Upload each encrypted blob to Walrus
      const client = getWalrusWriteClient();
      const epochs = hoursToEpochs(selectedHours);
      const singleBlobIds: string[] = [];
      const singleObjectIds: string[] = [];

      for (let i = 0; i < filesRef.current.length; i++) {
        setProgressMessage(`Encoding blob ${i + 1}/${filesRef.current.length}…`);
        setProgress(30);

        const flow = client.writeBlobFlow({ blob: filesRef.current[i].encrypted!.ciphertext });
        const encoded = await flow.encode();
        singleBlobIds[i] = encoded.blobId;

        setProgressMessage(`Registering ${i + 1}/${filesRef.current.length}…`);
        setProgress(40);

        const registerTx = flow.register({ epochs, deletable: true, owner: account.address });
        toast.info('Approve registration in your wallet…');
        const regResult = await dAppKit.signAndExecuteTransaction({ transaction: registerTx });
        if (regResult.FailedTransaction) throw new Error(regResult.FailedTransaction.status.error?.message ?? 'Registration failed.');
        await suiClient!.waitForTransaction({ digest: regResult.Transaction.digest });

        setProgressMessage(`Uploading slivers ${i + 1}/${filesRef.current.length}…`);
        setProgress(55);
        await flow.upload({ digest: regResult.Transaction.digest });

        setProgressMessage(`Certifying ${i + 1}/${filesRef.current.length}…`);
        setProgress(70);
        toast.info('Approve certification in your wallet…');
        const certTx = client.writeBlobFlow({ blob: filesRef.current[i].encrypted!.ciphertext }).certify();
        const certResult = await dAppKit.signAndExecuteTransaction({ transaction: certTx });
        if (certResult.FailedTransaction) throw new Error(certResult.FailedTransaction.status.error?.message ?? 'Certification failed.');
        await suiClient!.waitForTransaction({ digest: certResult.Transaction.digest });

        singleObjectIds[i] = (await client.writeBlobFlow({ blob: filesRef.current[i].encrypted!.ciphertext }).getBlob()).blobObjectId;
      }

      setProgress(85);
      setProgressMessage('Uploading…');

      // Step 3: Pack into ZIP if multiple, upload the pack
      if (isSingle) {
        const f = filesRef.current[0];
        setShareLink(`${config.appUrl}/d/${singleBlobIds[0]}#${f.keyB64!}.${f.ivB64!}.${encodeURIComponent(f.file.name)}`);
      } else {
        // Create ZIP from encrypted blobs
        setProgressMessage('Creating ZIP archive…');
        const zip = new JSZip();
        for (let i = 0; i < filesRef.current.length; i++) {
          zip.file(filesRef.current[i].file.name, filesRef.current[i].encrypted!.ciphertext);
        }

        setProgressMessage('Encrypting ZIP pack…');
        const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
        const zipKey = await generateKey();
        const { ciphertext: zipCiphertext, iv: zipIv } = await encryptFile(new Uint8Array(zipBuffer.buffer).buffer as ArrayBuffer, zipKey);
        const zipKeyB64 = await exportKey(zipKey);
        const zipIvB64 = btoa(String.fromCharCode(...zipIv))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        setProgressMessage('Registering ZIP on Walrus…');
        setProgress(90);
        const zipFlow = client.writeBlobFlow({ blob: new Uint8Array(zipBuffer.buffer) });
        const zipEncoded = await zipFlow.encode();

        const zipRegTx = zipFlow.register({ epochs, deletable: true, owner: account.address });
        toast.info('Approve ZIP registration…');
        const zipRegResult = await dAppKit.signAndExecuteTransaction({ transaction: zipRegTx });
        if (zipRegResult.FailedTransaction) throw new Error('ZIP registration failed.');
        await suiClient!.waitForTransaction({ digest: zipRegResult.Transaction.digest });

        setProgressMessage('Uploading ZIP slivers…');
        await zipFlow.upload({ digest: zipRegResult.Transaction.digest });

        setProgressMessage('Certifying ZIP…');
        toast.info('Approve ZIP certification…');
        const zipCertTx = zipFlow.certify();
        const zipCertResult = await dAppKit.signAndExecuteTransaction({ transaction: zipCertTx });
        if (zipCertResult.FailedTransaction) throw new Error('ZIP certification failed.');
        await suiClient!.waitForTransaction({ digest: zipCertResult.Transaction.digest });

        setShareLink(`${config.appUrl}/d/${zipEncoded.blobId}#${zipKeyB64}.${zipIvB64}.${encodeURIComponent('throwit-pack.zip')}`);
      }

      setProgress(100);
      setProgressMessage('Done!');

      // Save metadata to localStorage
      if (isSingle) {
        const f = filesRef.current[0];
        const upload: UploadedFileMeta = { blobId: singleBlobIds[0], blobObjectId: singleObjectIds[0], filename: f.file.name, size: f.file.size, uploadedAt: Date.now(), keyB64: f.keyB64!, ivB64: f.ivB64! };
        if (onSave) onSave(upload); else {
          const key = `throwit_uploads_${account.address}`;
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.unshift(upload); localStorage.setItem(key, JSON.stringify(list));
        }
      } else {
        const allIds = singleBlobIds.join(',');
        const allObjs = singleObjectIds.join(',');
        const allKeys = filesRef.current.map(f => f.keyB64!).join('|');
        const allIvs = filesRef.current.map(f => f.ivB64!).join('|');
        const upload: UploadedFileMeta = { blobId: allIds, blobObjectId: allObjs, filename: `${filesRef.current.length} files (ZIP)`, size: totalSize, uploadedAt: Date.now(), keyB64: allKeys, ivB64: allIvs };
        if (onSave) onSave(upload); else {
          const key = `throwit_uploads_${account.address}`;
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.unshift(upload); localStorage.setItem(key, JSON.stringify(list));
        }
      }

      if (onNotifySuccess) onNotifySuccess();
      else window.dispatchEvent(new Event('throwit_upload_success'));

      setStep('done');
      toast.success(isSingle ? 'Uploaded and encrypted!' : `${filesRef.current.length} files packed and uploaded!`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setErrorType(classifyError(err));
      setStep('error');
    }
  }, [account, dAppKit, selectedHours, suiClient, totalSize, options]);

  const retryUpload = useCallback(async () => {
    setError(null);
    setErrorType('unknown');
    setProgress(0);
    setProgressMessage('');
    await executeUpload();
  }, [executeUpload]);

  const handleCopy = useCallback(() => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);

  const resetUpload = useCallback(() => {
    filesRef.current = [];
    setStep('idle');
    setFileInfos([]);
    setTotalSize(0);
    setSingleFile(null);
    setShareLink(null);
    setError(null);
    setErrorType('unknown');
    setProgress(0);
    setProgressMessage('');
    setCopied(false);
  }, []);

  return {
    fileInfos, totalSize, fileCount: filesRef.current.length, singleFile,
    step, setStep, selectedHours, setSelectedHours, shareLink,
    progress, progressMessage, error, errorType, copied, setCopied,
    getRootProps, getInputProps, isDragActive,
    executeUpload, retryUpload, handleCopy, resetUpload, removeFile,
  };
}

function classifyError(err: unknown): UploadErrorType {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('rejected') || msg.includes('cancelled') || msg.includes('denied')) return 'wallet-rejected';
    if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('gas')) return 'insufficient-funds';
    if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch failed')) return 'network-timeout';
    if (msg.includes('encode') || msg.includes('blob') || msg.includes('size')) return 'blob-encoding';
  }
  return 'unknown';
}
