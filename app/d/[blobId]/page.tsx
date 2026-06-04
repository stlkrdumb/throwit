'use client';

import { use, useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Check, X, FileText } from 'lucide-react';
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
  const [, setFileSize] = useState<number>(0);
  const downloadTriggered = useRef(false);

  useEffect(() => {
    if (downloadTriggered.current) return;
    downloadTriggered.current = true;

    (async () => {
      try {
        // Step 1: Parse URL fragment (key + iv are never sent to server)
        const parsed = parseShareLink(window.location.hash);
        if (!parsed) {
          setStatus('error');
          setMessage('Invalid share link — missing decryption key.');
          return;
        }

        setFileName(parsed.filename);
        setMessage('Fetching encrypted blob from Walrus…');
        setProgress(20);

        // Step 2: Download encrypted blob
        const ciphertext = await downloadBlob(blobId);
        setFileSize(ciphertext.length);
        setProgress(50);
        setMessage('Decrypting file locally…');

        // Step 3: Import key + decrypt
        const key = await importKey(parsed.key);
        const ivBytes = Uint8Array.from(
          atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0)
        );
        const plaintext = await decryptFile(ciphertext, key, ivBytes);

        // Step 4: Trigger browser download
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

        setMessage(`Downloaded ${parsed.filename}`);
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
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/60 flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              status === 'done'
                ? 'bg-emerald-500/10'
                : status === 'error'
                ? 'bg-red-500/10'
                : 'bg-blue-500/10'
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
              {status === 'done' ? 'Downloaded!' : status === 'error' ? 'Error' : 'Downloading…'}
            </h2>
            {fileName && (
              <p className="text-xs text-slate-500 truncate">{fileName}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {(status === 'fetching' || status === 'decrypting') && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">{message}</p>
              <Progress value={progress} className="h-1 bg-slate-800" />
            </div>
          )}

          {status === 'done' && (
            <Alert className="border-emerald-900/50 bg-emerald-950/20 text-emerald-400">
              <Check className="h-4 w-4" />
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive" className="border-red-900/50 bg-red-950/20 text-red-400">
              <X className="h-4 w-4" />
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
}
