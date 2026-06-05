'use client';

import { use, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Download, Check, X, AlertCircle, Shield, ArrowRightLeft } from 'lucide-react';
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

type State = 'init' | 'fetching' | 'decrypting' | 'done' | 'error' | 'cancelled';

export default function DownloadPage({
  params,
}: {
  params: Promise<{ blobId: string }>;
}) {
  const { blobId } = use(params);
  const [state, setState] = useState<State>('init');
  const [parsed, setParsed] = useState<ReturnType<typeof parseShareLink>>(null);
  const [error, setError] = useState<string>('');

  // Parse link on mount
  if (state === 'init' && !parsed) {
    try {
      const parsedData = parseShareLink(window.location.hash);
      setParsed(parsedData);
      if (!parsedData) {
        setState('error');
        setError('Invalid share link — missing decryption key.');
      }
    } catch {
      setState('error');
      setError('Invalid share link format.');
    }
  }

  // Fetch & decrypt
  const startDownload = async () => {
    if (!parsed) return;
    setState('fetching');

    try {
      const ciphertext = await downloadBlob(blobId);
      setState('decrypting');

      const key = await importKey(parsed.key);
      const ivBytes = Uint8Array.from(
        atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
        (c) => c.charCodeAt(0)
      );
      const plaintext = await decryptFile(ciphertext, key, ivBytes);

      const blob = new Blob([plaintext]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = parsed.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.');
      setState('error');
    }
  };

  // ── State: Init (waiting for user choice) ────────────
  if (state === 'init' && parsed) {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Package card */}
          <Card className="w-full border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8 flex flex-col items-center gap-5 overflow-hidden">
            {/* Icon */}
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
              <Download className="h-6 w-6 text-emerald-400" />
            </div>

            {/* Filename */}
            <p className="text-sm font-semibold text-slate-200 break-all leading-relaxed max-w-[260px] mx-auto text-center">
              {parsed.filename}
            </p>

            {/* Info */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
              <Shield className="h-3 w-3" />
              Encrypted on Walrus · Decrypted locally in your browser
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={startDownload}
                className="flex-1 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-sm font-medium text-slate-950 transition-colors cursor-pointer"
              >
                Download
              </button>
              <button
                onClick={() => setState('cancelled')}
                className="flex-1 h-10 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── State: Cancelled ────────────────────────────────
  if (state === 'cancelled') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in duration-300">
          <p className="text-sm font-medium text-slate-400">Download cancelled</p>
          <button
            onClick={() => { setState('init'); setParsed(parseShareLink(window.location.hash) || null); }}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── State: Error (bad link) ────────────────────────
  if (state === 'error') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="w-full border-red-900/40 bg-red-950/20 backdrop-blur-sm p-8 flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-sm font-medium text-red-300 text-center">Invalid share link</p>
            <p className="text-xs text-red-400/60 text-center max-w-[240px]">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // ── State: Fetching / Decrypting (spinner only) ───
  if (state === 'fetching' || state === 'decrypting') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in duration-300">
          {/* Loading ring */}
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div
              className={`absolute inset-0 rounded-full border-2 animate-spin ${
                state === 'fetching'
                  ? 'border-t-emerald-400'
                  : 'border-t-violet-400'
              }`}
              style={{ animationDuration: '0.9s' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── State: Done ────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in duration-300">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
              <Check className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-200">Saved to downloads</p>
          <p className="text-xs text-slate-500 mt-1 truncate max-w-[260px] mx-auto">{parsed?.filename}</p>
        </div>
      </div>
    );
  }

  return null;
}
