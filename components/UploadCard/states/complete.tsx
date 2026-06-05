'use client';

import { useState } from 'react';
import { ArrowUpRight, QrCode, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUploadContext } from '../context';
import { FileInfoRow } from '../components/file-info';

export function CompleteState() {
  const { state, actions } = useUploadContext();
  const { fileInfos, shareLink, copied } = state;
  const { handleCopy, resetUpload } = actions;
  const [qrOpen, setQrOpen] = useState(false);

  if (!shareLink) return null;

  return (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b-[var(--neo-border-bold)] flex items-center gap-3 bg-[var(--neo-lime)]/10">
        <div className="h-9 w-9 rounded-[var(--neo-radius-md)] bg-[var(--neo-lime)]/25 border-[2px] border-[var(--neo-lime)] flex items-center justify-center shrink-0 neo-shadow-sm">
          <svg className="h-4.5 w-4.5 text-[var(--neo-lime)]" style={{ fontSize: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold uppercase tracking-tight text-[var(--neo-text-primary)]">File Encrypted</h2>
          <p className="text-[10px] font-mono text-[var(--neo-text-muted)]">AVAILABLE TO SHARE VIA SECURE LINK</p>
        </div>
      </div>

      {/* File info */}
      {fileInfos.length > 0 && (
        <FileInfoRow name={fileInfos[0].name} size={fileInfos[0].size} variant="success" />
      )}

      {/* Share link — neo-input style */}
      <div className="flex gap-2">
        <Input
          value={shareLink}
          readOnly
          className="neo-input bg-[var(--neo-surface)] border-[3px] border-[var(--neo-black)] text-xs font-mono truncate h-9 placeholder:text-slate-500"
        />
        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="shrink-0 border-[var(--neo-border-bold)] bg-white text-black hover:bg-[var(--neo-pink)] active:translate-y-[1px] transition-all h-9 neo-button-like"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--neo-radius-sm)] border-[var(--neo-border-bold)] bg-[var(--neo-lime)] text-xs font-bold uppercase tracking-wide text-black hover:-translate-y-[2px] transition-all duration-100 active:translate-y-[1px] neo-button-like"
          style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Open Link
        </a>

        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--neo-radius-sm)] border-[var(--neo-border-bold)] bg-slate-800 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-primary)] hover:-translate-y-[2px] transition-all duration-100 active:translate-y-[1px]"
          style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
        >
          <QrCode className="h-3.5 w-3.5" />
          QR Code
        </button>

        <span className="text-[var(--neo-text-muted)] self-center">·</span>

        <button
          onClick={resetUpload}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--neo-radius-sm)] border-[var(--neo-border-bold)] bg-slate-800 text-xs font-bold uppercase tracking-wide text-[var(--neo-text-primary)] hover:-translate-y-[2px] transition-all duration-100 active:translate-y-[1px]"
          style={{ boxShadow: '3px 3px 0 var(--neo-black)' }}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Upload New
        </button>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="border-[var(--neo-border-bold)] bg-[var(--neo-surface)] max-w-xs p-6 flex flex-col items-center text-center overscroll-y-contain neo-shadow-lg rounded-[var(--neo-radius-md)]">
          <DialogHeader className="gap-1 items-center">
            <DialogTitle className="text-sm font-bold uppercase tracking-wide text-[var(--neo-text-primary)]">
              Scan QR Code
            </DialogTitle>
            <DialogDescription className="text-[10px] font-mono text-[var(--neo-text-muted)]">
              SCAN TO DOWNLOAD DIRECTLY ON MOBILE
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 bg-[var(--neo-page-bg)] border-[var(--neo-border-bold)] rounded-[var(--neo-radius-md)] flex items-center justify-center neo-shadow-sm">
            <QRCodeSVG
              value={shareLink}
              size={180}
              bgColor="#0A0A0A"
              fgColor="var(--neo-lime)"
              level="M"
              includeMargin={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
