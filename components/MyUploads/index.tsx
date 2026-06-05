'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useDAppKit, useCurrentClient } from '@mysten/dapp-kit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, ExternalLink, HardDrive, ShieldAlert, Loader2, Info } from 'lucide-react';
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

export function MyUploads() {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const suiClient = useCurrentClient();
  
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
      } catch {
        console.error('Failed to parse uploads history');
      }
    } else {
      setUploads([]);
    }
  };

  useEffect(() => {
    loadUploads();
    
    // Auto-refresh on new upload events
    const handleUploadSuccess = () => {
      loadUploads();
    };
    window.addEventListener('throwit_upload_success', handleUploadSuccess);
    return () => window.removeEventListener('throwit_upload_success', handleUploadSuccess);
  }, [account]);

  const handleCopy = (item: UploadItem, index: number) => {
    const link = buildShareLink(item.blobId, item.keyB64, item.ivB64, item.filename);
    navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    toast.success('Share link copied');
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

  const totalSizeBytes = uploads.reduce((acc, curr) => acc + curr.size, 0);

  if (!account) return null;

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Active Shares</span>
          {uploads.length > 0 && (
            <span className="text-[10px] text-slate-500 font-mono">{uploads.length} files · {formatFileSize(totalSizeBytes)}</span>
          )}
        </div>
      </div>

      {/* Info Banner */}
      {uploads.length > 0 && (
        <div className="flex gap-2.5 p-3 mx-4 mt-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-[10px] text-slate-400 leading-normal">
          <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>Storage on Walrus is paid using temporary epoch deposits. Self-destruct any active file to claim your WAL refund back to your wallet.</span>
        </div>
      )}

      {/* Upload List */}
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
        {uploads.length > 0 ? (
          uploads.map((item, index) => (
            <div
              key={item.blobId}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-800/60 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{item.filename}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {formatFileSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Explorer */}
                <a
                  href={`https://walruscan.com/${config.network}/blob/${item.blobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  title="View on Walrus Explorer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Copy Link */}
                <button
                  onClick={() => handleCopy(item, index)}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy Share Link"
                >
                  {copiedIndex === index ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item, index)}
                  disabled={deletingIndex !== null}
                  className="p-1.5 rounded-md hover:bg-red-950/30 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete & reclaim deposit"
                >
                  {deletingIndex === index ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShieldAlert className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs font-medium text-slate-400">No active shares</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-[180px] leading-relaxed">
              Your encrypted uploads will appear here for sharing and deletion.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
