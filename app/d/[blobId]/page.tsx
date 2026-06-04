'use client';

import { use, useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Check, X, Shield, Clock } from 'lucide-react';
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

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  }

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

        // Download encrypted blob
        const ciphertext = await downloadBlob(blobId);
        setFileSize(ciphertext.length);
        setProgress(50);
        setMessage('Decrypting file locally…');

        // Import key + decrypt
        const key = await importKey(parsed.key);
        const ivBytes = Uint8Array.from(
          atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0)
        );
        const plaintext = await decryptFile(ciphertext, key, ivBytes);

        // Trigger browser download
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

        setMessage(`Successfully decrypted and downloaded!`);
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

  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-slate-950 flex flex-col justify-center items-center px-6">
      {/* Decorative ambient auras */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md group">
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 opacity-30 blur-xl group-hover:opacity-40 transition duration-300" />
        
        <Card className="relative z-10 w-full border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ring-1 ${
                  status === 'done'
                    ? 'bg-emerald-500/10 ring-emerald-500/20'
                    : status === 'error'
                    ? 'bg-red-500/10 ring-red-500/20'
                    : 'bg-blue-500/10 ring-blue-500/20'
                }`}
              >
                {status === 'done' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : status === 'error' ? (
                  <X className="h-4 w-4 text-red-400" />
                ) : (
                  <Download className="h-4 w-4 text-blue-400 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-200">
                  {status === 'done' ? 'Download Complete' : status === 'error' ? 'Download Failed' : 'Downloading File'}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Shield className="h-3 w-3 text-slate-600" />
                  Client-side decryption
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* File Info Box */}
            {fileName ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-700/50">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
                  {(fileSize > 0) ? (
                    <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(fileSize)}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Fetching/Decrypting Progress */}
            {(status === 'fetching' || status === 'decrypting') ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {message}
                  </span>
                  <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-800" />
              </div>
            ) : null}

            {/* Success */}
            {status === 'done' ? (
              <Alert className="border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-xs py-2.5">
                <Check className="h-3.5 w-3.5" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}

            {/* Error */}
            {status === 'error' ? (
              <Alert variant="destructive" className="border-red-900/40 bg-red-950/20 text-red-400 text-xs py-2.5">
                <X className="h-3.5 w-3.5" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
