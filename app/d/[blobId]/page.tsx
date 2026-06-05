'use client';

import { use, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Download, Check, X, ArrowRightLeft, Shield, AlertCircle } from 'lucide-react';
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

type State = 'waiting' | 'fetching' | 'decrypting' | 'done' | 'error';

export default function DownloadPage({
  params,
}: {
  params: Promise<{ blobId: string }>;
}) {
  const { blobId } = use(params);
  const [state, setState] = useState<State>('waiting');
  const [parsed, setParsed] = useState<ReturnType<typeof parseShareLink>>(null);
  const [error, setError] = useState<string>('');
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const parsed = parseShareLink(window.location.hash);
    if (!parsed) {
      setState('error');
      setError('Invalid share link — missing decryption key.');
      return;
    }

    setParsed(parsed);
  }, [blobId]);

  useEffect(() => {
    if (state !== 'waiting' || !parsed) return;
    const timer = setTimeout(() => setState('fetching'), 600);
    return () => clearTimeout(timer);
  }, [state, parsed]);

  // Fetch & decrypt flow
  useEffect(() => {
    if (!parsed || (state !== 'fetching' && state !== 'decrypting')) return;

    (async () => {
      try {
        const ciphertext = await downloadBlob(blobId);

        setState('decrypting');

        const key = await importKey(parsed.key);
        const ivBytes = Uint8Array.from(
          atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
          (c) => c.charCodeAt(0)
        );
        const plaintext = await decryptFile(ciphertext, key, ivBytes);

        // Trigger download (brief delay lets the browser actually start it)
        setTimeout(() => setState('done'), 400);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed.');
        setState('error');
      }
    })();
  }, [blobId, parsed, state]);

  // ── State: Waiting ───────────────────────────────
  if (state === 'waiting' && parsed) {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group cursor-default">
            {/* Glow on hover */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />

            {/* Package card */}
            <Card className="relative z-10 w-full border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8 flex flex-col items-center gap-4 overflow-hidden transition-all duration-200 group-hover:border-slate-700">
              {/* Envelope icon */}
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
                <Download className="h-7 w-7 text-emerald-400" />
              </div>

              {/* Filename */}
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-200 break-all leading-relaxed max-w-[260px] mx-auto">{parsed.filename}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center">
                  <Shield className="h-3 w-3" />
                  Encrypted on Walrus · Ready to decrypt
                </p>
              </div>

              {/* Auto-start pulse */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ArrowRightLeft className="h-3 w-3 animate-pulse" />
                Starting download in a moment…
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── State: Error (invalid link) ─────────────────
  if (state === 'error') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="w-full border-red-900/40 bg-red-950/20 backdrop-blur-sm p-8 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <p className="text-sm font-medium text-red-300 text-center">Invalid share link</p>
            <p className="text-xs text-red-400/60 text-center max-w-[240px]">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // ── State: Fetching / Decrypting ────────────────
  if (state === 'fetching' || state === 'decrypting') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center animate-in fade-in duration-300">
          {/* Loading ring */}
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div
              className="absolute inset-0 rounded-full border-2 border-t-emerald-400 animate-spin"
              style={{ animationDuration: '0.9s' }}
            />
          </div>

          {/* Filename */}
          <p className="text-sm font-medium text-slate-300 truncate max-w-[260px] mx-auto">{parsed?.filename}</p>
        </div>
      </div>
    );
  }

  // ── State: Done ─────────────────────────────────
  if (state === 'done') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm animate-in fade-in scale-100 duration-300">
          {/* Check circle — pops in */}
          <div className="relative mx-auto mb-6">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-200 text-center">Saved to downloads</p>
          <p className="text-xs text-slate-500 text-center mt-1 truncate max-w-[260px] mx-auto">{parsed?.filename}</p>

          {/* Retry button */}
          <button
            onClick={() => setState('fetching')}
            className="mt-4 px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Download Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
