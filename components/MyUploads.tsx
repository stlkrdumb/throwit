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
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-5 h-12 rounded-[var(--neo-radius-md)] bg-white text-black border-[3px] border-black font-bold uppercase tracking-wide text-xs shadow-[4px_4px_0_var(--neo-black)] hover:-translate-y-[2px] transition-all duration-100 active:translate-y-[1px] neo-button-like cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--neo-cyan)] focus-visible:ring-offset-2"
      >
        <HardDrive className="h-4 w-4" />
        Active Shares
        {uploads.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--neo-radius-sm)] bg-[var(--neo-pink)] border-[2px] border-black text-[10px] font-bold text-white">
            {uploads.length}
          </span>
        )}
      </button>

      {/* Drawer Overlay (Backdrop) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-[var(--neo-page-bg)]/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Side Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[520px] bg-[var(--neo-surface)] border-l-[3px] border-black shadow-xl p-6 flex flex-col gap-6 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b-[var(--neo-border-bold)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)]/15 border-[2px] border-[var(--neo-pink)] flex items-center justify-center neo-shadow-sm">
              <HardDrive className="h-4 w-4 text-[var(--neo-pink)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">Active Shares</h2>
              <p className="text-[10px] font-mono text-[var(--neo-text-muted)]">MANAGE UPLOADS & STORAGE REBATES</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-[var(--neo-radius-sm)] border-[2px] border-slate-800 bg-slate-950/40 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer neo-button-like"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Row */}
        {uploads.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-4 rounded-[var(--neo-radius-md)] border-[var(--neo-border-bold)] bg-[var(--neo-page-bg)] neo-shadow-sm">
            <div>
              <p className="text-[10px] text-[var(--neo-text-muted)] uppercase font-bold">Active Files</p>
              <p className="text-lg font-black text-[var(--neo-cyan)] font-mono mt-0.5">{uploads.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--neo-text-muted)] uppercase font-bold">Staged Size</p>
              <p className="text-lg font-black text-[var(--neo-text-primary)] font-mono mt-0.5">{formatFileSize(totalSizeBytes)}</p>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="flex gap-2.5 p-3 rounded-[var(--neo-radius-md)] border-[2px] border-[var(--neo-lime)]/30 bg-[var(--neo-lime)]/10 text-[10px] font-mono text-[var(--neo-text-muted)] leading-relaxed">
          <Info className="h-4 w-4 text-[var(--neo-lime)] shrink-0 mt-0.5" />
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
                className={`flex items-center justify-between gap-4 p-3.5 rounded-[var(--neo-radius-md)] border-[2px] border-slate-800 bg-[var(--neo-page-bg)] hover:border-slate-700 transition-all neo-hover-lift ${fileType.stripClass}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* File type icon */}
                  <div className={`h-8 w-8 rounded-[var(--neo-radius-sm)] border-2 flex items-center justify-center shrink-0 ${isZip ? 'bg-[var(--neo-lime)]/20 border-[var(--neo-lime)]' : ''}`} style={{ color: fileType.color }}>
                    {fileType.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--neo-text-primary)] truncate">{item.filename}</p>
                    <p className="text-[10px] font-mono text-[var(--neo-text-muted)] mt-0.5">
                      {formatFileSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString()}
                      {isZip ? (
                        <button
                          type="button"
                          onClick={() => setExpandedZip(expandedZip === index ? null : index)}
                          className="ml-1.5 text-[var(--neo-cyan)] hover:text-[var(--neo-lime)] transition-colors inline-flex items-center gap-0.5 uppercase font-bold tracking-wide"
                        >
                          {showEntries ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                          Contents
                        </button>
                      ) : null}
                    </p>
                  </div>
                </div>

                {/* ZIP contents popup */}
                {isZip && showEntries ? (
                  <div className="absolute left-0 right-full mr-2 top-0 w-64 p-3 rounded-[var(--neo-radius-md)] border-[var(--neo-border-bold)] bg-[var(--neo-surface)] shadow-xl z-10 neo-shadow-lg">
                    <p className="text-[10px] font-bold text-[var(--neo-text-primary)] uppercase tracking-wide mb-2">Contained Files</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(getEntryList(item, account.address) || []).map((e, ei) => (
                        <div key={ei} className="flex items-center gap-2 py-1 px-2 rounded-[var(--neo-radius-sm)] hover:bg-slate-800/50 transition-colors">
                          <span className="text-[9px] font-mono text-[var(--neo-text-muted)] w-3">{ei + 1}</span>
                          <span className="text-[10px] font-medium text-[var(--neo-text-primary)] truncate flex-1">{e.name}</span>
                          <span className="text-[9px] font-mono text-[var(--neo-text-muted)] shrink-0">{formatFileSize(e.size)}</span>
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
                    className="h-7 w-7 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-[var(--neo-cyan)]/10 flex items-center justify-center text-[var(--neo-text-muted)] hover:text-[var(--neo-cyan)] transition-all cursor-pointer neo-button-like"
                    title="View on Walrus Explorer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleCopy(item, index)}
                    className="h-7 w-7 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-[var(--neo-lime)]/10 flex items-center justify-center text-[var(--neo-text-muted)] transition-all cursor-pointer neo-button-like"
                    title="Copy Share Link"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3.5 w-3.5 text-[var(--neo-lime)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* QR Code */}
                  <button
                    onClick={() => { setQrItem(item); setQrOpen(true); }}
                    className="h-7 w-7 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-[var(--neo-purple)]/10 flex items-center justify-center text-[var(--neo-text-muted)] transition-all cursor-pointer neo-button-like"
                    title="Show QR Code"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete & Refund */}
                  <button
                    onClick={() => handleDelete(item, index)}
                    disabled={deletingIndex !== null}
                    className="h-7 w-7 rounded-[var(--neo-radius-sm)] border-2 border-slate-800 bg-transparent hover:bg-[var(--neo-red)]/10 flex items-center justify-center text-[var(--neo-text-muted)] hover:text-[var(--neo-red)] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer neo-button-like"
                    title="Delete file & reclaim WAL deposit"
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--neo-red)]" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-[var(--neo-border-bold)] border-dashed rounded-[var(--neo-radius-md)]">
              <ShieldAlert className="h-9 w-9 text-[var(--neo-text-muted)] mb-2.5" />
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">No Active Uploads</p>
              <p className="text-[10px] font-mono text-[var(--neo-text-muted)] mt-2 max-w-[240px] leading-relaxed">
                YOUR ENCRYPTED UPLOADS WILL APPEAR HERE FOR SHARING AND DELETION.
              </p>
            </div>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={qrOpen} onOpenChange={(open) => { setQrOpen(open); if (!open) setQrItem(null); }}>
          <DialogContent className="border-[var(--neo-border-bold)] bg-[var(--neo-surface)] max-w-xs p-6 flex flex-col items-center text-center overscroll-y-contain neo-shadow-lg rounded-[var(--neo-radius-md)]">
            <DialogHeader className="gap-1 items-center">
              <DialogTitle className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">Scan QR Code</DialogTitle>
              <DialogDescription className="text-[10px] font-mono text-[var(--neo-text-muted)]">
                SCAN TO DOWNLOAD DIRECTLY ON MOBILE
              </DialogDescription>
            </DialogHeader>
            {qrItem && (
              <div className="mt-4 p-3 bg-[var(--neo-page-bg)] border-[var(--neo-border-bold)] rounded-[var(--neo-radius-md)] flex items-center justify-center neo-shadow-sm">
                <QRCodeSVG
                  value={buildShareLink(qrItem.blobId, qrItem.keyB64, qrItem.ivB64, qrItem.filename)}
                  size={180}
                  bgColor="#0A0A0A"
                  fgColor="var(--neo-lime)"
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
