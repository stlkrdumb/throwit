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
      <div className="px-2 py-4 border-b border-slate-800/60 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
          <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-slate-200">File Encrypted</h2>
          <p className="text-xs text-slate-500">Your file is now available to share via a secure link</p>
        </div>
      </div>

      {/* File info */}
      {fileInfos.length > 0 && (
        <FileInfoRow name={fileInfos[0].name} size={fileInfos[0].size} variant="success" />
      )}

      {/* Share link */}
      <div className="flex gap-2">
        <Input
          value={shareLink}
          readOnly
          className="bg-slate-800/50 border-slate-700 text-xs font-mono truncate h-9 placeholder:text-slate-600"
        />
        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="shrink-0 border-slate-700 hover:bg-slate-800 active:translate-y-[1px] transition-all h-9"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Open Link
        </a>

        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <QrCode className="h-3.5 w-3.5" />
          QR Code
        </button>

        <span className="text-slate-800 self-center">·</span>

        <button
          onClick={resetUpload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Upload New Files
        </button>
      </div>

      {/* QR Dialog */}
      {/* Close dialog wrapper — ensure no margin-bottom overflow */}
      <div className="mt-4" />
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="border-slate-800 bg-slate-950 max-w-xs p-6 flex flex-col items-center text-center overscroll-y-contain">
          <DialogHeader className="gap-1 items-center">
            <DialogTitle className="text-sm font-semibold text-slate-100">
              Scan QR Code
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Scan to download directly on mobile
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 bg-[#090d16] border border-slate-800 rounded-xl flex items-center justify-center">
            <QRCodeSVG
              value={shareLink}
              size={180}
              bgColor="#090d16"
              fgColor="#10b981"
              level="M"
              includeMargin={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
