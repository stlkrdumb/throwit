'use client';

import { use, useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Check, X, Shield, Clock, FileIcon } from 'lucide-react';
import { downloadBlob } from '@/lib/walrus';
import { decryptFile, importKey } from '@/lib/crypto';

function parseShareLink(hash: string) {
  const clean = hash.replace(/^#/, '');
  const parts = clean.split('.');
  if (parts.length < 3) return null;
  const [key, iv, ...filenameParts] = parts;
  return {
    key,
    iv,
    filename: decodeURIComponent(filenameParts.join('.')),
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

export default function DownloadPage({
  params,
}: {
  params: Promise<{ blobId: string }>;
}) {
  const { blobId } = use(params);
  const [status, setStatus] = useState<'fetching' | 'decrypting' | 'done' | 'error'>('fetching');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Fetching encrypted blob from Walrus…');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const downloadTriggered = useRef(false);

  useEffect(() => {
    if (downloadTriggered.current) return;
    downloadTriggered.current = true;

    (async () => {
      try {
        const parsed = parseShareLink(window.location.hash);
        if (!parsed) {
          setStatus('error');
          setMessage('Invalid share link — missing decryption key.');
          return;
        }

        setFileName(parsed.filename);
        setMessage('Fetching encrypted blob from Walrus…');
        setProgress(20);

        const ciphertext = await downloadBlob(blobId);
        setFileSize(ciphertext.length);
        setProgress(50);
        setMessage('Decrypting file locally…');

        const key = await importKey(parsed.key);
        const ivBytes = Uint8Array.from(
          atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0)
        );
        const plaintext = await decryptFile(ciphertext, key, ivBytes);

        setProgress(100);
        setStatus('done');

        const blob = new Blob([plaintext]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = parsed.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setMessage('Successfully decrypted and downloaded!');
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : 'Failed to download or decrypt file. The link may be expired.'
        );
      }
    })();
  }, [blobId]);

  const statusConfig = {
    fetching: { icon: <Download className="h-4 w-4 text-blue-400 animate-pulse" />, color: 'bg-blue-500/10 ring-blue-500/20', title: 'Downloading File' },
    decrypting: { icon: <Clock className="h-4 w-4 text-violet-400 animate-pulse" />, color: 'bg-violet-500/10 ring-violet-500/20', title: 'Decrypting File' },
    done: { icon: <Check className="h-4 w-4 text-emerald-400" />, color: 'bg-emerald-500/10 ring-emerald-500/20', title: 'Download Complete' },
    error: { icon: <X className="h-4 w-4 text-red-400" />, color: 'bg-red-500/10 ring-red-500/20', title: 'Download Failed' },
  };

  const current = statusConfig[status];

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
          {/* Header */}
          <div className="px-2 py-4 border-b border-slate-800/60 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ring-1 ${current.color}`}>
              {current.icon}
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-200">{current.title}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Shield className="h-3 w-3" />
                Client-side decryption · End-to-end encrypted
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* File Info */}
            {fileName ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-700/50">
                  <FileIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
                  {fileSize > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{formatFileSize(fileSize)}</p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Progress */}
            {(status === 'fetching' || status === 'decrypting') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{message}</span>
                  <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-800" />
              </div>
            )}

            {/* Success */}
            {status === 'done' ? (
              <Alert className="border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-xs py-2.5">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}

            {/* Error */}
            {status === 'error' ? (
              <Alert variant="destructive" className="border-red-900/40 bg-red-950/20 text-red-400 text-xs py-2.5">
                <X className="h-3.5 w-3.5 shrink-0" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
