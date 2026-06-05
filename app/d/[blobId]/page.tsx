'use client';

import { use, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Download, Check, X, AlertCircle } from 'lucide-react';
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
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-[var(--neo-cream)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Package card — neobrutalist */}
          <Card className="w-full border-[3px] border-black bg-white p-8 flex flex-col items-center gap-5 neo-shadow-lg rounded-[var(--neo-radius-md)]">
            {/* Icon */}
            <div className="h-14 w-14 rounded-[var(--neo-radius-md)] bg-[var(--neo-cyan)] border-3 border-black flex items-center justify-center neo-shadow-sm">
              <Download className="h-6 w-6 text-white" />
            </div>

            {/* Filename */}
            <p className="text-sm font-bold text-[var(--neo-text-primary)] break-all leading-relaxed max-w-[260px] mx-auto text-center uppercase">{parsed.filename}</p>

            {/* Info */}
            <p className="text-xs font-mono text-[var(--neo-text-muted)] flex items-center gap-1.5 justify-center">
              <Check className="h-3 w-3" />
              ENCRYPTED ON WALRUS · DECRYPTED LOCALLY IN YOUR BROWSER
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={startDownload}
                className="flex-1 h-10 rounded-[var(--neo-radius-sm)] border-[3px] border-black bg-[var(--neo-lime)] hover:-translate-y-[2px] text-sm font-bold uppercase tracking-wide text-black transition-all duration-100 active:translate-y-[1px] neo-button-like"
                style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
              >
                Download
              </button>
              <button
                onClick={() => setState('cancelled')}
                className="flex-1 h-10 rounded-[var(--neo-radius-sm)] border-[3px] border-black bg-white hover:bg-slate-100 text-sm font-bold uppercase tracking-wide transition-all duration-100 active:translate-y-[1px] neo-button-like"
                style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
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
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-[var(--neo-cream)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">Download Cancelled</p>
          <button
            onClick={() => { setState('init'); setParsed(parseShareLink(window.location.hash) || null); }}
            className="mt-3 px-4 py-2 rounded-[var(--neo-radius-sm)] border-2 border-black bg-[var(--neo-pink)] hover:-translate-y-[1px] text-xs font-bold uppercase tracking-wide transition-all duration-100 neo-button-like"
            style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── State: Error (bad link) ────────────────────────
  if (state === 'error') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-[var(--neo-cream)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="w-full border-[3px] border-[var(--neo-red)] bg-white p-8 flex flex-col items-center gap-4 neo-shadow-lg rounded-[var(--neo-radius-md)]" style={{ borderTop: '6px solid var(--neo-red)' }}>
            <div className="h-14 w-14 rounded-[var(--neo-radius-md)] bg-[var(--neo-red)] border-3 border-black flex items-center justify-center neo-shadow-sm">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">Invalid Share Link</p>
            <p className="text-xs font-mono text-[var(--neo-text-muted)] text-center max-w-[240px]">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // ── State: Fetching / Decrypting (spinner only) ───
  if (state === 'fetching' || state === 'decrypting') {
    const label = state === 'fetching' ? 'FETCHING FROM WALRUS...' : 'DECRYPTING LOCALLY...';
    const colorClass = state === 'fetching' ? 'bg-[var(--neo-pink)] border-[var(--neo-pink)]' : 'border-[var(--neo-cyan)] bg-transparent';
    
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-[var(--neo-cream)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          {/* Loading ring — solid, no blur */}
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div
              className={`absolute inset-0 rounded-full border-4 animate-spin ${colorClass}`}
              style={{ animationDuration: '0.9s' }}
            />
          </div>
          <p className="text-xs font-mono font-bold uppercase tracking-wide text-[var(--neo-text-muted)]">{label}</p>
        </div>
      </div>
    );
  }

  // ── State: Done ────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-[var(--neo-cream)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-[var(--neo-lime)] border-3 border-black flex items-center justify-center neo-shadow-sm">
              <Check className="h-7 w-7 text-white" />
            </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">Saved to Downloads</p>
          <p className="text-xs font-mono text-[var(--neo-text-muted)] mt-2 truncate max-w-[260px] mx-auto">{parsed?.filename}</p>
        </div>
      </div>
    );
  }

  return null;
}
