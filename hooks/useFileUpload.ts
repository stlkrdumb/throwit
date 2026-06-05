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
import {
  uploadToStorage,
  waitForUploadCertified,
  listUploads,
  cancelUploadRenewal,
  instantDeleteUpload,
} from '@/lib/storage';
import { config, getStorageApiKey } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

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
  | 'walrus-nodes-error'
  | 'unknown';

interface SelectedFile {
  file: File;
}

export interface ZipPackMeta {
  isPack: true;
  entryCount: number;
  entries: { name: string; size: number }[];
}

export interface UploadedFileMeta {
  blobId: string;
  blobObjectId: string;
  filename: string;
  size: number;
  uploadedAt: number;
  keyB64: string;
  ivB64: string;
  zipMeta?: ZipPackMeta;
  jobId?: string;
  storageProvider?: 'walrus' | 'tatum';
}

export interface UseFileUploadOptions {
  onSave?: (upload: UploadedFileMeta) => void;
  onNotifySuccess?: () => void;
}

export interface UseFileUploadReturn {
  fileInfos: { name: string; size: number }[];
  totalSize: number;
  singleFile: File | null;

  step: UploadStep;
  setStep: React.Dispatch<React.SetStateAction<UploadStep>>;

  selectedHours: number;
  setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
  shareLink: string | null;
  progress: number;
  progressMessage: string;
  error: string | null;
  errorType: UploadErrorType;
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;

  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;

  executeUpload: () => Promise<void>;
  retryUpload: () => Promise<void>;
  handleCopy: () => void;
  resetUpload: () => void;
  removeFile: (index: number) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSave, onNotifySuccess } = options;

  const dAppKit = useDAppKit();
  const account = useCurrentAccount();
  const suiClient = useCurrentClient();
  const { authMode } = useAuth();

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

    const newSelected: SelectedFile[] = [
      ...filesRef.current,
      ...acceptedFiles.map((f) => ({ file: f, progress: 0 })),
    ];
    const total = newSelected.reduce((sum, s) => sum + s.file.size, 0);

    if (total > MAX_TOTAL_SIZE) {
      setError(`Too much data. Max ${formatFileSize(MAX_TOTAL_SIZE)} total.`);
      return;
    }

    filesRef.current = newSelected;
    setFileInfos(newSelected.map((s) => ({ name: s.file.name, size: s.file.size })));
    setTotalSize(total);
    setSingleFile(newSelected.length === 1 ? newSelected[0].file : null);
    setShareLink(null);
    setStep('selected');
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    maxSize: MAX_FILE_SIZE,
    onDropAccepted: () => setError(null),
  });

  const removeFile = useCallback((index: number) => {
    const newFiles = filesRef.current.filter((_, i) => i !== index);
    const newInfos = fileInfos.filter((_, i) => i !== index);
    if (newFiles.length === 0) { resetUpload(); return; }
    filesRef.current = newFiles;
    setFileInfos(newInfos);
    setTotalSize(newFiles.reduce((s, f) => s + f.file.size, 0));
    setSingleFile(newFiles.length === 1 ? newFiles[0].file : null);
  }, [fileInfos]);

  // --- Core upload — ZIP-only for packs, direct encrypt for single ---
  const executeUpload = useCallback(async (): Promise<void> => {
    if (filesRef.current.length === 0) throw new Error('No files selected');
    
    const isTatumMode = authMode === 'gasless';
    if (!isTatumMode && !account) {
      toast.error('Connect your wallet first');
      return;
    }

    setStep('encrypting');
    setError(null);
    setProgress(0);

    const isPack = filesRef.current.length > 1;

    try {
      // Prepare ciphertext + IV + the key used to encrypt it
      let dataToUpload: Uint8Array;
      let finalIv: Uint8Array;
      let encryptionKey: CryptoKey;

      if (isPack) {
        setProgressMessage(`Packing ${filesRef.current.length} files into ZIP…`);
        setProgress(5);

        // Pack all original files into ZIP
        const zip = new JSZip();
        for (const f of filesRef.current) {
          zip.file(f.file.name, f.file);
        }

        setProgressMessage('Encrypting ZIP pack…');
        setProgress(15);

        const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
        const rawData = new Uint8Array(zipBuffer.buffer as ArrayBuffer);

        // Encrypt the ZIP with a fresh key
        const packKey = await generateKey();
        encryptionKey = packKey;
        const packEncrypted = await encryptFile(rawData.buffer as ArrayBuffer, packKey);
        dataToUpload = new Uint8Array(packEncrypted.ciphertext);
        finalIv = packEncrypted.iv;
      } else {
        // Single file: encrypt directly with a key
        setProgressMessage('Encrypting file…');
        setProgress(5);

        const fileKey = await generateKey();
        encryptionKey = fileKey;
        const encResult = await encryptFile(filesRef.current[0].file, fileKey);
        dataToUpload = new Uint8Array(encResult.ciphertext);
        finalIv = encResult.iv;
      }

      // Check storage provider (determined by authMode context)
      // isTatumMode is already computed above

      if (isTatumMode) {
        // ─── TATUM STORAGE MODE ──────────────────────────────────────────────
        // Upload encrypted file to Tatum Storage API (handles Walrus on-chain)
        setProgressMessage('Uploading to Tatum Storage…');

        // Create a Blob from the encrypted data for Tatum upload
        const encryptedBlob = new Blob(
          [dataToUpload.buffer as ArrayBuffer || dataToUpload],
          { type: 'application/octet-stream' },
        );
        const uploadFile = new File(
          [encryptedBlob],
          isPack ? 'throwit-pack.zip' : filesRef.current[0].file.name,
          { type: encryptedBlob.type },
        );

        const apiKey = getStorageApiKey();
        if (!apiKey) {
          throw new Error('Storage API key not found. Please configure your Tatum API key.');
        }

        // Step 1: Upload to Tatum (async certification)
        setProgress(30);
        const uploadResult = await uploadToStorage(uploadFile, apiKey);
        const { blobId: tatumBlobId, jobId } = uploadResult;

        if (!jobId) {
          throw new Error('Upload failed: no jobId returned');
        }

        setProgress(40);
        setProgressMessage('Waiting for Walrus certification…');

        // Step 2: Poll until CERTIFIED (Tatum handles all on-chain txs automatically)
        const certResult = await waitForUploadCertified(
          jobId,
          apiKey,
          (status) => {
            switch (status) {
              case 'PENDING':
                setProgressMessage('File staged, waiting for Walrus worker…');
                setProgress(50);
                break;
              case 'UPLOADING':
                setProgressMessage('Uploading to Walrus nodes…');
                setProgress(65);
                break;
              case 'CERTIFIED':
                setProgress(90);
                break;
              default:
                break;
            }
          },
        );

        // Use Tatum's download URL (already has the blobId embedded)
        const tatumDownloadUrl = certResult.downloadUrlByQuiltId || certResult.downloadUrlByQuiltPatchId;
        if (!tatumDownloadUrl) {
          throw new Error('Certified but missing download URL');
        }

          // Export key + build share link (Tatum mode uses Tatum's download URL)
        const keyB64 = await exportKey(encryptionKey);
        const ivB64 = btoa(String.fromCharCode(...finalIv))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // Store Tatum download URL for later retrieval
        const tatumStorageKey = `throwit_tatum_download_${tatumBlobId}`;
        localStorage.setItem(tatumStorageKey, JSON.stringify({
          downloadUrl: tatumDownloadUrl,
          jobId,
          status: 'CERTIFIED',
          savedAt: Date.now(),
        }));

        // Build share link using our app URL format (always goes through /d/[blobId])
        const realFilename = isPack ? 'throwit-pack.zip' : filesRef.current[0].file.name;
        setShareLink(`${config.appUrl}/d/${tatumBlobId}#${keyB64}.${ivB64}.${encodeURIComponent(realFilename)}`);

        // Save metadata (Tatum mode uses Tatum's blobId)
        const tatumUpload: UploadedFileMeta = {
          blobId: tatumBlobId,
          blobObjectId: '', // Tatum manages on-chain storage
          filename: realFilename,
          size: totalSize,
          uploadedAt: Date.now(),
          keyB64,
          ivB64,
          zipMeta: isPack ? {
            isPack: true,
            entryCount: filesRef.current.length,
            entries: filesRef.current.map((f) => ({ name: f.file.name, size: f.file.size })),
          } : undefined,
          jobId,
          storageProvider: 'tatum',
        };

        if (onSave) onSave(tatumUpload);
        else {
          const historyAddress = account?.address || 'gasless';
          const key = `throwit_uploads_${historyAddress}`;
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.unshift(tatumUpload); localStorage.setItem(key, JSON.stringify(list));
        }

        if (onNotifySuccess) onNotifySuccess();
        else window.dispatchEvent(new Event('throwit_upload_success'));

        setProgress(100);
        setStep('done');
        toast.success(isPack ? `${filesRef.current.length} files packed & uploaded via Tatum!` : 'Uploaded to Tatum Storage!');
      } else {
        // ─── WALRUS CLIENT MODE (testnet / direct) ───────────────────────────
        setProgressMessage('Uploading to Walrus…');

        const client = getWalrusWriteClient();
        const epochs = hoursToEpochs(selectedHours);
        const flow = client.writeBlobFlow({ blob: dataToUpload });
        const encoded = await flow.encode();
        const blobId = encoded.blobId;

        setProgress(50);
        setProgressMessage('Registering on-chain…');
        const regTx = flow.register({ epochs, deletable: true, owner: account!.address });
        toast.info('Approve registration in your wallet…');
        const regResult = await dAppKit.signAndExecuteTransaction({ transaction: regTx });
        if (regResult.FailedTransaction) throw new Error(regResult.FailedTransaction.status.error?.message ?? 'Registration failed.');
        await suiClient!.waitForTransaction({ digest: regResult.Transaction.digest });

        setProgress(75);
        setProgressMessage('Uploading slivers…');
        await flow.upload({ digest: regResult.Transaction.digest });

        setProgressMessage('Certifying on-chain…');
        setProgress(90);
        toast.info('Approve certification in your wallet…');
        const certTx = flow.certify();
        const certResult = await dAppKit.signAndExecuteTransaction({ transaction: certTx });
      
        if (certResult.FailedTransaction) throw new Error(certResult.FailedTransaction.status.error?.message ?? 'Certification failed.');
        await suiClient!.waitForTransaction({ digest: certResult.Transaction.digest });

        const blobObjectId = (await flow.getBlob()).blobObjectId;

        // Export key + build share link
        setProgressMessage('Finalizing…');
        const keyB64 = await exportKey(encryptionKey);
        const ivB64 = btoa(String.fromCharCode(...finalIv))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const realFilename = isPack ? 'throwit-pack.zip' : filesRef.current[0].file.name;
        setShareLink(`${config.appUrl}/d/${blobId}#${keyB64}.${ivB64}.${encodeURIComponent(realFilename)}`);

        // Save metadata
      const upload: UploadedFileMeta = {
        blobId,
        blobObjectId,
        filename: realFilename,
        size: totalSize,
        uploadedAt: Date.now(),
        keyB64,
        ivB64,
        zipMeta: isPack ? {
          isPack: true,
          entryCount: filesRef.current.length,
          entries: filesRef.current.map((f) => ({ name: f.file.name, size: f.file.size })),
        } : undefined,
        storageProvider: 'walrus',
      };

      if (onSave) onSave(upload);
      else {
        const historyAddress = account?.address || 'gasless';
        const key = `throwit_uploads_${historyAddress}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift(upload); localStorage.setItem(key, JSON.stringify(list));
      }

        if (onNotifySuccess) onNotifySuccess();
        else window.dispatchEvent(new Event('throwit_upload_success'));

        setProgress(100);
        setStep('done');
        toast.success(isPack ? `${filesRef.current.length} files packed & uploaded!` : 'Uploaded and encrypted!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setErrorType(classifyError(err));
      setStep('error');
    }
  }, [account, authMode, dAppKit, selectedHours, suiClient, totalSize, options]);

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
    fileInfos, totalSize, singleFile,
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
    if (msg.includes('timeout')) return 'network-timeout';
    if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('ssl') || msg.includes('cert')) return 'walrus-nodes-error';
    if (msg.includes('notenoughblobconfirmations') || msg.includes('failures while writing') || msg.includes('write sliver') || msg.includes('store sliver')) return 'walrus-nodes-error';
    if (msg.includes('encode') || msg.includes('blob') || msg.includes('size')) return 'blob-encoding';
  }
  return 'unknown';
}
