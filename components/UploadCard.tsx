'use client';

import { useCallback, useRef, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { Upload, X, FileText, Copy, Check, Clock3, Shield } from 'lucide-react';
import { generateKey, encryptFile, exportKey } from '@/lib/crypto';
import { uploadBlob } from '@/lib/walrus';
import { buildShareLink } from '@/lib/link';

const EXPIRY_OPTIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '3 Hours', hours: 3 },
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type Step = 'idle' | 'selected' | 'encrypting' | 'uploading' | 'done' | 'error';

export function UploadCard() {
  const fileRef = useRef<File | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [selectedHours, setSelectedHours] = useState(3);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    maxSize: 100 * 1024 * 1024,
    onDropAccepted: () => setError(null),
  });

  // Generate a testnet keypair for signing Walrus transactions.
  // In production this would use wallet-based signing via PTB.
  // Fund via: https://faucet.sui.io/
  const getTestnetSigner = () => new Ed25519Keypair();

  const handleUpload = async () => {
    if (!fileInfo || !fileRef.current) return;
    setStep('encrypting');
    setError(null);
    setProgress(0);

    try {
      // Step 1: Generate key + encrypt file
      const key = await generateKey();
      const { ciphertext, iv } = await encryptFile(fileRef.current, key);
      const keyB64 = await exportKey(key);
      const ivB64 = btoa(String.fromCharCode(...iv))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      setProgress(25);
      setStep('uploading');

      // Step 2: Upload to Walrus
      const signer = getTestnetSigner();
      const blobId = await uploadBlob(signer, ciphertext, selectedHours);

      setProgress(100);

      // Step 3: Build share link
      const link = buildShareLink(blobId, keyB64, ivB64, fileInfo.name);
      setShareLink(link);
      setStep('done');
      toast.success('File uploaded and encrypted!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Make sure your testnet wallet has SUI + WAL.');
      setStep('error');
    }
  };

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetUpload = () => {
    fileRef.current = null;
    setStep('idle');
    setFileInfo(null);
    setShareLink(null);
    setError(null);
    setProgress(0);
    setCopied(false);
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
            <Upload className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-200">Upload File</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              End-to-end encrypted · stored on Walrus
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-200 cursor-pointer active:scale-[0.99] ${
            isDragActive
              ? 'border-emerald-500/60 bg-emerald-500/5 ring-2 ring-emerald-500/20'
              : step === 'error'
              ? 'border-red-800/60 bg-red-950/10 hover:border-red-700'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/20'
          }`}
        >
          <input {...getInputProps()} />
          {(step === 'idle' || step === 'error') && (
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="h-14 w-14 rounded-full bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700/50 group-hover:ring-slate-600/50 transition-all">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  {isDragActive ? 'Drop it here' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Max 100 MB. Encrypted in browser before upload.</p>
              </div>
            </div>
          )}

          {step === 'selected' && fileInfo && (
            <div className="flex items-center gap-3 w-full max-w-sm pointer-events-none">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-700/50">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{fileInfo.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(fileInfo.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          )}
        </div>

        {/* Expiry Selector */}
        {(step === 'selected' || step === 'encrypting' || step === 'uploading') && (
          <Tabs value={String(selectedHours)} onValueChange={(v) => setSelectedHours(Number(v))}>
            <TabsList className="w-full grid grid-cols-4 bg-slate-800/40 border border-slate-700/50">
              {EXPIRY_OPTIONS.map((opt) => (
                <TabsTrigger
                  key={opt.label}
                  value={String(opt.hours)}
                  className={`text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300 ring-0 focus-visible:ring-0`}
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Progress */}
        {(step === 'encrypting' || step === 'uploading') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock3 className="h-3 w-3" />
                {step === 'encrypting' ? 'Encrypting file locally…' : 'Uploading to Walrus…'}
              </span>
              <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-800" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="border-red-900/40 bg-red-950/20 text-red-400 text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        {step === 'selected' && (
          <Button
            onClick={handleUpload}
            className="w-full text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all duration-200 active:translate-y-[1px]"
          >
            Encrypt & Upload
          </Button>
        )}

        {/* Done / Share Link */}
        {step === 'done' && shareLink && (
          <div className="space-y-3">
            <Alert className="border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-xs py-2.5">
              <Check className="h-3.5 w-3.5" />
              <AlertDescription>Upload complete! Share this link with anyone.</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="bg-slate-800/50 border-slate-700 text-xs font-mono truncate h-9 placeholder:text-slate-600"
              />
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="shrink-0 border-slate-700 hover:bg-slate-800 active:translate-y-[1px] transition-all h-9"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 hover:decoration-slate-500 transition-colors"
              >
                Open link
              </a>
              <span className="text-slate-800">·</span>
              <button
                onClick={resetUpload}
                className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 hover:decoration-slate-500 transition-colors"
              >
                Upload another file
              </button>
            </div>
          </div>
        )}
      </div>

      <Toaster richColors position="bottom-right" theme="dark" />
    </Card>
  );
}
