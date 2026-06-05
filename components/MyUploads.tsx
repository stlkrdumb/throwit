'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useDAppKit, useCurrentClient } from '@mysten/dapp-kit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, ExternalLink, HardDrive, ShieldAlert, Loader2, X, Info, QrCode, FileImage, FileVideo, FileAudio2, FileArchive, FileCode, FileType, FileLock, ChevronDown, ChevronUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

const EXTENSION_MAP: Record<string, { icon: React.ReactNode; color: string; stripClass: string }> = {
  image: { icon: <FileImage className="h-4 w-4" />, color: 'var(--neo-pink)', stripClass: 'file-strip--image' },
  video: { icon: <FileVideo className="h-4 w-4" />, color: 'var(--neo-cyan)', stripClass: 'file-strip--video' },
  audio: { icon: <FileAudio2 className="h-4 w-4" />, color: 'var(--neo-amber)', stripClass: 'file-strip--audio' },
  archive: { icon: <FileArchive className="h-4 w-4" />, color: 'var(--neo-lime)', stripClass: 'file-strip--archive' },
  code: { icon: <FileCode className="h-4 w-4" />, color: 'var(--neo-purple)', stripClass: 'file-strip--code' },
  default: { icon: <FileLock className="h-4 w-4" />, color: '#64748b', stripClass: '' },
};



// Check if an upload is a ZIP pack and return its entries
function getZipPack(item: UploadItem) {
  // Heuristic: filename ends with .zip OR size looks like compressed data
  const ext = item.filename.split('.').pop()?.toLowerCase();
  if (ext === 'zip') return { isZip: true, filename: item.filename };
  // Check localStorage zipMeta if stored
  return null;
}

function getEntryList(item: UploadItem, address?: string): { name: string; size: number }[] | null {
  if (!address) return null;
  const key = `throwit_uploads_${address}`;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const upload = list.find((u: any) => u.blobId === item.blobId);
  return upload?.zipMeta?.entries ?? null;
}

const TYPE_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
  video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'],
  audio: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'wma', 'm4a'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  code: ['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'go', 'rs', 'c', 'cpp', 'h', 'java', 'json', 'xml', 'yaml', 'yml', 'md', 'toml', 'ini', 'env', 'lock'],
};

function getExtensionType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  for (const [type, extensions] of Object.entries(TYPE_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return EXTENSION_MAP[type as keyof typeof EXTENSION_MAP];
    }
  }
  return EXTENSION_MAP.default;
}

// Alias for backwards compat with getFileType
function getFileType(filename: string) {
  return getExtensionType(filename);
}

export function MyUploads() {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const suiClient = useCurrentClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrItem, setQrItem] = useState<UploadItem | null>(null);
  const [expandedZip, setExpandedZip] = useState<number | null>(null);

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
    
    // Listen for custom upload events to auto-refresh history
    const handleUploadSuccess = () => {
      loadUploads();
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
        className="fixed bottom-12 right-6 z-40 inline-flex items-center gap-2.5 px-5 h-12 rounded-[4px] bg-secondary text-black border-3 border-black font-black uppercase tracking-wider text-xs shadow-[4px_4px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)] transition-all duration-100 cursor-pointer outline-none"
      >
        <HardDrive className="h-4.5 w-4.5" />
        Active Shares
        {uploads.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-primary border-2 border-black text-[10px] font-black text-white ml-0.5">
            {uploads.length}
          </span>
        )}
      </button>

      {/* Drawer Overlay (Backdrop) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Side Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[520px] bg-card border-l-4 border-black p-6 flex flex-col gap-6 transition-transform duration-300 ease-out shadow-[-8px_0_0_var(--color-primary)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[4px] bg-primary border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] text-black">
              <HardDrive className="h-4.5 w-4.5 text-black" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Active Shares</h2>
              <p className="text-xs font-mono text-muted-foreground font-semibold">Manage Uploads & Storage Rebates</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-destructive hover:text-white flex items-center justify-center text-foreground transition-all cursor-pointer shadow-[2px_2px_0_var(--color-secondary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Row */}
        {uploads.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-4 rounded-[4px] border-3 border-black bg-background shadow-[4px_4px_0_var(--color-primary)]">
            <div>
              <p className="text-xs text-foreground uppercase font-black tracking-wide">Active Files</p>
              <p className="text-lg font-black text-foreground font-mono mt-0.5">{uploads.length}</p>
            </div>
            <div>
              <p className="text-xs text-foreground uppercase font-black tracking-wide">Staged Size</p>
              <p className="text-lg font-black text-foreground font-mono mt-0.5">{formatFileSize(totalSizeBytes)}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex gap-2.5 p-3 rounded-[4px] border-3 border-black bg-secondary text-xs font-mono text-black font-semibold leading-relaxed shadow-[4px_4px_0_var(--color-accent)]">
          <Info className="h-4.5 w-4.5 text-black shrink-0 mt-0.5" />
          <span>
            WAL storage uses temporary epoch deposits. Self-destruct any file on-chain to instantly claim your refund.
          </span>
        </div>

        {/* Scrollable File List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {uploads.length > 0 ? (
            uploads.map((item, index) => {
              const isZip = item.filename.endsWith('.zip') || item.filename === 'throwit-pack.zip';
              const fileType = getFileType(isZip ? item.filename : item.filename);
              const showEntries = isZip && expandedZip === index;

              return (
                <div
                  key={item.blobId}
                  className="relative flex items-center justify-between gap-4 p-3.5 rounded-[4px] border-3 border-black bg-muted shadow-[4px_4px_0_var(--color-accent)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-accent)] transition-all duration-100"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* File type icon */}
                    <div className="h-9 w-9 rounded-[4px] border-2 border-black bg-card text-foreground shadow-[2px_2px_0_#000] flex items-center justify-center shrink-0">
                      {fileType.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wide truncate">{item.filename}</p>
                      <p className="text-xs font-mono text-muted-foreground font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{formatFileSize(item.size)}</span>
                        <span>·</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                        {isZip ? (
                          <button
                            type="button"
                            onClick={() => setExpandedZip(expandedZip === index ? null : index)}
                            className="text-primary hover:text-foreground font-black uppercase tracking-wider transition-colors inline-flex items-center gap-0.5 cursor-pointer underline"
                          >
                            {showEntries ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            Contents
                          </button>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {/* ZIP contents popup */}
                  {isZip && showEntries ? (
                    <div className="absolute right-full mr-3 top-0 w-64 p-3 rounded-[4px] border-3 border-black bg-card shadow-[6px_6px_0_var(--color-accent)] z-10 text-foreground">
                      <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">Contained Files</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(getEntryList(item, account.address) || []).map((e, ei) => (
                          <div key={ei} className="flex items-center gap-2 py-1 px-2 rounded-[4px] border border-transparent hover:bg-secondary hover:text-black transition-colors">
                            <span className="text-[11px] font-mono text-muted-foreground font-semibold w-3">{ei + 1}</span>
                            <span className="text-xs font-bold text-foreground truncate flex-1">{e.name}</span>
                            <span className="text-[11px] font-mono text-muted-foreground font-semibold shrink-0">{formatFileSize(e.size)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View on Explorer */}
                    <a
                      href={`https://walruscan.com/${config.network}/blob/${item.blobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-secondary flex items-center justify-center text-foreground hover:text-black shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)] transition-all cursor-pointer"
                      title="View on Walrus Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopy(item, index)}
                      className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-secondary flex items-center justify-center text-foreground hover:text-black shadow-[2px_2px_0_#B2FF59] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#B2FF59] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#B2FF59] transition-all cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3.5 w-3.5 text-green-600 font-bold" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => { setQrItem(item); setQrOpen(true); }}
                      className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-secondary flex items-center justify-center text-foreground hover:text-black shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)] transition-all cursor-pointer"
                      title="Show QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete & Refund */}
                    <button
                      onClick={() => handleDelete(item, index)}
                      disabled={deletingIndex !== null}
                      className="h-8 w-8 rounded-[4px] border-2 border-black bg-card hover:bg-destructive hover:text-white flex items-center justify-center text-foreground shadow-[2px_2px_0_#FF5252] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#FF5252] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#FF5252] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      title="Delete file & reclaim WAL deposit"
                    >
                      {deletingIndex === index ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive font-bold" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-3 border-dashed border-black rounded-[4px] bg-muted shadow-[4px_4px_0_var(--color-secondary)] p-6">
              <ShieldAlert className="h-10 w-10 text-foreground mb-3" />
              <p className="text-xs font-black uppercase tracking-wider text-foreground">No Active Uploads</p>
              <p className="text-xs text-muted-foreground font-medium mt-2 max-w-[240px] leading-relaxed">
                Your encrypted uploads will appear here for sharing and deletion.
              </p>
            </div>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={qrOpen} onOpenChange={(open) => { setQrOpen(open); if (!open) setQrItem(null); }}>
          <DialogContent className="border-3 border-black bg-card text-foreground max-w-xs p-6 flex flex-col items-center text-center overscroll-y-contain shadow-[8px_8px_0_var(--color-secondary)] rounded-[4px]">
            <DialogHeader className="gap-1 items-center">
              <DialogTitle className="text-sm font-black uppercase tracking-wider text-foreground">Scan QR Code</DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground font-semibold">
                Scan to download directly on mobile
              </DialogDescription>
            </DialogHeader>
            {qrItem && (
              <div className="mt-4 p-3 bg-white border-3 border-black rounded-[4px] flex items-center justify-center shadow-[4px_4px_0_var(--color-primary)]">
                <QRCodeSVG
                  value={buildShareLink(qrItem.blobId, qrItem.keyB64, qrItem.ivB64, qrItem.filename)}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                  includeMargin={true}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}


