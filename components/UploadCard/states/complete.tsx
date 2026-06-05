'use client';

import { useState } from 'react';
import { ArrowUpRight, QrCode, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      <div className="px-4 py-4 border-b-3 border-black flex items-center gap-3 bg-[#B2FF59]">
        <div className="h-9 w-9 rounded-[4px] bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_#000]">
          <svg className="h-4.5 w-4.5 text-black" style={{ fontSize: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex-1 text-black">
          <h2 className="text-sm font-black uppercase tracking-wider text-black">File Encrypted</h2>
          <p className="text-xs font-mono text-black font-bold">Available to share via secure link</p>
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
          className="bg-muted border-3 border-black text-xs font-mono truncate h-11 px-3 placeholder:text-slate-500 rounded-[4px] w-full text-foreground"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 h-11 px-4 border-3 border-black bg-primary text-primary-foreground font-black uppercase tracking-wider shadow-[4px_4px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--color-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] transition-all duration-100 cursor-pointer rounded-[4px] flex items-center justify-center"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] border-3 border-black bg-[#B2FF59] text-black shadow-[3px_3px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--color-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] transition-all duration-100 cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Open Link
        </a>

        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] border-3 border-black bg-secondary text-black shadow-[3px_3px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--color-secondary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-secondary)] transition-all duration-100 cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          <QrCode className="h-3.5 w-3.5" />
          QR Code
        </button>

        <span className="text-foreground self-center font-bold">·</span>

        <button
          onClick={resetUpload}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[4px] border-3 border-black bg-card text-foreground shadow-[3px_3px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_var(--color-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--color-primary)] transition-all duration-100 cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Upload New
        </button>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="border-3 border-black bg-card text-foreground max-w-xs p-6 flex flex-col items-center text-center overscroll-y-contain shadow-[8px_8px_0_var(--color-secondary)] rounded-[4px]">
          <DialogHeader className="gap-1 items-center">
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-foreground">
              Scan QR Code
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground font-semibold animate-pulse">
              Scan to download directly on mobile
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 bg-white border-3 border-black rounded-[4px] flex items-center justify-center shadow-[4px_4px_0_var(--color-primary)]">
            <QRCodeSVG
              value={shareLink}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="M"
              includeMargin={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
