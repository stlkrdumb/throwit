'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useDAppKit, useCurrentClient } from '@mysten/dapp-kit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, ExternalLink, HardDrive, ShieldAlert, Loader2, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getWalrusWriteClient } from '@/lib/walrus';
import { buildShareLink } from '@/lib/link';
import { config } from '@/lib/config';

interface UploadItem {
  blobId: string;
  blobObjectId: string;
  filename: string;
  size: number;
  uploadedAt: number;
  keyB64: string;
  ivB64: string;
}

export function MyUploads() {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const suiClient = useCurrentClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Load history from localStorage
  const loadUploads = () => {
    if (!account) {
      setUploads([]);
      return;
    }
    const key = `throwit_uploads_${account.address}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setUploads(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse uploads history', err);
      }
    } else {
      setUploads([]);
    }
  };

  useEffect(() => {
    loadUploads();
    
    // Listen for custom upload events to auto-refresh and highlight history
    const handleUploadSuccess = () => {
      loadUploads();
      // Auto-open drawer when a new file is uploaded so they see their link
      setIsOpen(true);
    };
    window.addEventListener('throwit_upload_success', handleUploadSuccess);
    return () => window.removeEventListener('throwit_upload_success', handleUploadSuccess);
  }, [account]);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopy = (item: UploadItem, index: number) => {
    const link = buildShareLink(item.blobId, item.keyB64, item.ivB64, item.filename);
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    toast.success('Share link copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDelete = async (item: UploadItem, index: number) => {
    if (!account) return;
    setDeletingIndex(index);
    toast.loading('Preparing self-destruct transaction…', { id: 'delete-toast' });

    try {
      const client = getWalrusWriteClient();
      
      const tx = client.deleteBlobTransaction({
        blobObjectId: item.blobObjectId,
        owner: account.address,
      });

      toast.info('Please approve the self-destruct transaction in your wallet…', { id: 'delete-toast' });

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      if (result.FailedTransaction) {
        throw new Error(
          result.FailedTransaction.status.error?.message ??
            'Delete transaction failed in wallet'
        );
      }

      toast.loading('Waiting for blockchain deletion confirmation…', { id: 'delete-toast' });
      await suiClient.waitForTransaction({ digest: result.Transaction.digest });

      const key = `throwit_uploads_${account.address}`;
      const updated = uploads.filter((_, i) => i !== index);
      localStorage.setItem(key, JSON.stringify(updated));
      setUploads(updated);

      toast.success('File deleted and WAL storage deposit refunded!', { id: 'delete-toast' });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete file on-chain.',
        { id: 'delete-toast' }
      );
    } finally {
      setDeletingIndex(null);
    }
  };

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  }

  // Calculate total size of active uploads
  const totalSizeBytes = uploads.reduce((acc, curr) => acc + curr.size, 0);

  if (!account) return null;

  return (
    <>
      {/* Floating Action Button (FAB) to toggle Drawer */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-5 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800/80 backdrop-blur-md text-xs font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 active:scale-95 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
      >
        <HardDrive className="h-4 w-4 text-emerald-400" />
        Active Shares & Refunds
        {uploads.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 animate-pulse">
            {uploads.length}
          </span>
        )}
      </button>

      {/* Drawer Overlay (Backdrop) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Side Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[460px] bg-slate-950 border-l border-slate-900 shadow-2xl p-6 flex flex-col gap-6 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
              <HardDrive className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Active Shares</h2>
              <p className="text-[10px] text-slate-500">Manage uploads and storage rebate returns</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Row */}
        {uploads.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-900 bg-slate-900/10">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Files</p>
              <p className="text-lg font-bold text-slate-200 font-mono mt-0.5">{uploads.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Staged Size</p>
              <p className="text-lg font-bold text-slate-200 font-mono mt-0.5">{formatFileSize(totalSizeBytes)}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex gap-2.5 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-[10px] text-slate-400 leading-normal">
          <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Storage on Walrus is paid using temporary epoch deposits. You can self-destruct any active file on-chain to instantly claim your WAL storage refund back to your wallet.
          </span>
        </div>

        {/* Scrollable File List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {uploads.length > 0 ? (
            uploads.map((item, index) => (
              <div
                key={item.blobId}
                className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{item.filename}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {formatFileSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* View on Explorer */}
                  <a
                    href={`https://walruscan.com/${config.network}/blob/${item.blobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg border border-slate-900 bg-slate-900/40 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                    title="View on Walrus Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleCopy(item, index)}
                    className="h-8 w-8 rounded-lg border border-slate-900 bg-slate-900/40 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy Share Link"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>

                  {/* Delete & Refund */}
                  <button
                    onClick={() => handleDelete(item, index)}
                    disabled={deletingIndex !== null}
                    className="h-8 w-8 rounded-lg border border-slate-900 bg-red-950/20 hover:bg-red-950/40 flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    title="Delete file & reclaim WAL deposit"
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 border border-dashed border-slate-900 rounded-xl">
              <ShieldAlert className="h-9 w-9 text-slate-700 mb-2.5" />
              <p className="text-xs font-semibold text-slate-400">No active uploads</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] leading-relaxed">
                Your encrypted uploads from this session will appear here for sharing and deletion.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
