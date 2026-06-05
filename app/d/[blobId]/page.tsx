'use client';

import { use, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Download, Check, X, AlertCircle } from 'lucide-react';
import { downloadBlob, downloadFromTatumUrl, parseShareLinkSource } from '@/lib/walrus';
import { decryptFile, importKey } from '@/lib/crypto';

type State = 'init' | 'fetching' | 'decrypting' | 'done' | 'error' | 'cancelled';

export default function DownloadPage({
  params,
}: {
  params: Promise<{ blobId: string }>;
}) {
  const { blobId } = use(params);
  const [state, setState] = useState<State>('init');
  const [parsed, setParsed] = useState<ReturnType<typeof parseShareLinkSource>>(null);
  const [error, setError] = useState<string>('');

  const isExecutable = (() => {
    if (!parsed?.filename) return false;
    const ext = parsed.filename.split('.').pop()?.toLowerCase();
    const dangerousExtensions = ['exe', 'dmg', 'sh', 'bat', 'msi', 'cmd', 'app', 'scr', 'bin', 'vbs', 'jar'];
    return ext ? dangerousExtensions.includes(ext) : false;
  })();

  // Parse link on mount
  if (state === 'init' && !parsed) {
    try {
      // Use base URL without hash for parsing
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const hash = window.location.hash;
      console.log('[Download] Base URL:', baseUrl);
      console.log('[Download] Hash:', hash);
      const parsedData = parseShareLinkSource(hash, baseUrl);
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

  // Fetch & decrypt - handles both Tatum and Walrus sources
  const startDownload = async () => {
    if (!parsed) return;
    setState('fetching');

    try {
      let ciphertext: Uint8Array;

      if (parsed.source === 'tatum') {
        // Download from Tatum Storage API URL
        if (!parsed.downloadUrl) throw new Error('Missing download URL');
        console.log('[Download] Fetching from Tatum:', parsed.downloadUrl);
        ciphertext = await downloadFromTatumUrl(parsed.downloadUrl);
      } else {
        // Download from Walrus aggregator via blobId
        if (!parsed.blobId) throw new Error('Missing blob ID');
        console.log('[Download] Fetching from Walrus:', parsed.blobId);
        ciphertext = await downloadBlob(parsed.blobId);
      }

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
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Package card — neobrutalist */}
          <Card className="w-full border-3 border-black bg-card p-8 flex flex-col items-center gap-5 shadow-[8px_8px_0_var(--color-secondary)] rounded-[4px]">
            {/* Icon */}
            <div className="h-14 w-14 rounded-[4px] bg-secondary border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Download className="h-6 w-6 text-black" />
            </div>

            {/* Filename */}
            <p className="text-sm font-black text-foreground break-all leading-relaxed max-w-[260px] mx-auto text-center uppercase tracking-wider">{parsed.filename}</p>

            {/* Info */}
            <p className="text-[10px] font-mono text-muted-foreground font-semibold flex items-center gap-1.5 justify-center uppercase">
              <Check className="h-3.5 w-3.5 text-secondary" />
              ENCRYPTED ON WALRUS · DECRYPTED LOCALLY IN YOUR BROWSER
            </p>

            {/* Warning for executables */}
            {isExecutable && (
              <div className="w-full p-3 rounded-[4px] border-2 border-black bg-[#FFAB40] text-black text-xs font-medium flex gap-2.5 shadow-[2px_2px_0_#000] text-left leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-black mt-0.5" />
                <span>
                  <strong>Caution:</strong> This is an executable file (`.{parsed?.filename.split('.').pop()}`). Make sure you trust the sender before opening or running it on your device.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={startDownload}
                className="flex-1 h-11 rounded-[4px] border-3 border-black bg-[#4CAF50] text-black shadow-[3px_3px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] text-xs font-black uppercase tracking-wider transition-all duration-100 cursor-pointer"
              >
                Download
              </button>
              <button
                onClick={() => setState('cancelled')}
                className="flex-1 h-11 rounded-[4px] border-3 border-black bg-muted text-foreground shadow-[3px_3px_0_var(--color-secondary)] hover:bg-card hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)] text-xs font-black uppercase tracking-wider transition-all duration-100 cursor-pointer"
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
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm font-black uppercase tracking-wider text-foreground">Download Cancelled</p>
          <button
            onClick={() => {
              const baseUrl = `${window.location.origin}${window.location.pathname}`;
              setState('init');
              setParsed(parseShareLinkSource(window.location.hash, baseUrl) || null);
            }}
            className="mt-3 px-4 py-2.5 rounded-[4px] border-3 border-black bg-primary text-primary-foreground shadow-[3px_3px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--color-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] text-xs font-black uppercase tracking-wider transition-all duration-100 cursor-pointer"
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
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="w-full border-3 border-black bg-card p-8 flex flex-col items-center gap-4 shadow-[8px_8px_0_var(--color-secondary)] rounded-[4px]">
            <div className="h-14 w-14 rounded-[4px] bg-destructive border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-foreground">Invalid Share Link</p>
            <p className="text-xs font-mono text-muted-foreground font-semibold text-center max-w-[240px] uppercase">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // ── State: Fetching / Decrypting (spinner only) ───
  if (state === 'fetching' || state === 'decrypting') {
    const label = state === 'fetching' ? 'FETCHING FROM WALRUS...' : 'DECRYPTING LOCALLY...';
    
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          {/* Loading ring — solid, no blur */}
          <div className="relative mx-auto mb-6 w-16 h-16 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-4 border-black border-t-primary animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
          </div>
          <p className="text-xs font-mono font-black uppercase tracking-wider text-foreground">{label}</p>
        </div>
      </div>
    );
  }

  // ── State: Done ────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-69px)] bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-[#4CAF50] border-3 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
              <Check className="h-7 w-7 text-white font-bold" />
            </div>
          </div>
          <p className="text-sm font-black uppercase tracking-wider text-foreground">Saved to Downloads</p>
          <p className="text-xs font-mono text-muted-foreground font-semibold mt-2 truncate max-w-[260px] mx-auto uppercase">{parsed?.filename}</p>
        </div>
      </div>
    );
  }

  return null;
}
