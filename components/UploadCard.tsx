'use client';

import { useDropzone } from 'react-dropzone';
import { useCurrentAccount } from '@mysten/dapp-kit-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, FileText, Copy, Check, Clock3, Shield, QrCode } from 'lucide-react';
import {
  formatFileSize,
  useFileUpload,
  UploadErrorType,
  UploadedFileMeta,
  ExpiryOption,
  EXPIRY_OPTIONS,
} from '@/hooks/useFileUpload';
import { WalletButton } from '@/components/WalletButton';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UploadCardProps {
  /** Optional callback to save upload metadata (e.g. dashboard uses this for localStorage). */
  onSave?: (upload: UploadedFileMeta) => void;
}

export function UploadCard({ onSave }: UploadCardProps) {
  const account = useCurrentAccount();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const {
    fileInfo,
    step,
    selectedHours,
    setSelectedHours,
    shareLink,
    progress,
    progressMessage,
    error,
    errorType,
    copied,
    setCopied,
    getRootProps,
    getInputProps,
    isDragActive,
    executeUpload,
    retryUpload,
    handleCopy,
    resetUpload,
  } = useFileUpload({ onSave });

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
            <Upload className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-200">Upload File</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              End-to-end encrypted · stored on Walrus
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-200 cursor-pointer active:scale-[0.99] ${
            isDragActive
              ? 'border-emerald-500/60 bg-emerald-500/5 ring-2 ring-emerald-500/20'
              : step === 'error'
              ? 'border-red-800/60 bg-red-950/10 hover:border-red-700'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/20'
          }`}
        >
          <input {...getInputProps()} />
          {(step === 'idle' || step === 'error') ? (
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="h-14 w-14 rounded-full bg-slate-800/80 flex items-center justify-center ring-1 ring-slate-700/50 group-hover:ring-slate-600/50 transition-all">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  {isDragActive ? 'Drop it here' : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Max 100 MB. Encrypted in browser before upload.</p>
              </div>
            </div>
          ) : null}

          {((step === 'selected' || step === 'encrypting' || step === 'uploading') && fileInfo) ? (
            <div className="flex items-center gap-3 w-full max-w-sm pointer-events-none">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-700/50">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{fileInfo.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(fileInfo.size)}</p>
              </div>
              {step === 'selected' ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                  className="h-8 w-8 rounded-lg hover:bg-slate-700 flex items-center justify-center shrink-0 active:scale-95 transition-transform pointer-events-auto"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Expiry Selector */}
        {(step === 'selected' || step === 'encrypting' || step === 'uploading') ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              Storage Duration
            </label>
            <Tabs value={String(selectedHours)} onValueChange={(v) => setSelectedHours(Number(v))}>
              <TabsList className="w-full grid grid-cols-4 bg-slate-800/40 border border-slate-700/50">
                {EXPIRY_OPTIONS.map((opt: ExpiryOption) => (
                  <TabsTrigger
                    key={opt.label}
                    value={String(opt.hours)}
                    disabled={step !== 'selected'}
                    className={`text-xs data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 hover:text-slate-300 ring-0 focus-visible:ring-0`}
                  >
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        ) : null}

        {/* Progress */}
        {(step === 'encrypting' || step === 'uploading') ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock3 className="h-3 w-3" />
                {progressMessage}
              </span>
              <span className="text-emerald-400 font-mono tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-800" />
          </div>
        ) : null}

        {/* Error with retry */}
        {error ? (
          <div className="space-y-2">
            <Alert variant="destructive" className="border-red-900/40 bg-red-950/20 text-red-400 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {/* Recovery actions — context-aware based on error type */}
            {errorType === 'wallet-rejected' && (
              <div className="p-3 rounded-lg border border-amber-900/30 bg-amber-950/10 flex flex-col gap-2">
                <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Transaction rejected</p>
                <p className="text-[10px] text-slate-500">Your wallet denied the transaction. Make sure you're using the correct network and try again.</p>
                <div className="flex gap-2">
                  <button
                    onClick={retryUpload}
                    className="px-3 py-1 rounded bg-amber-500/20 border border-amber-800/50 hover:bg-amber-500/30 text-[10px] font-medium text-amber-300 transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    onClick={resetUpload}
                    className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-[10px] font-medium text-slate-400 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            {errorType === 'insufficient-funds' && (
              <div className="p-3 rounded-lg border border-red-900/30 bg-red-950/10 flex flex-col gap-2">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Insufficient funds</p>
                <p className="text-[10px] text-slate-500">You need SUI in your wallet to pay for gas and storage staking. Get testnet SUI from the <a href="https://faucet.sui.io/" target="_blank" rel="noopener noreferrer" className="text-red-300 underline decoration-red-800 hover:decoration-red-600">Sui faucet</a>.</p>
                <div className="flex gap-2">
                  <button
                    onClick={resetUpload}
                    className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-[10px] font-medium text-slate-400 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            {errorType === 'network-timeout' && (
              <div className="p-3 rounded-lg border border-orange-900/30 bg-orange-950/10 flex flex-col gap-2">
                <p className="text-[10px] font-medium text-orange-400 uppercase tracking-wider">Network error</p>
                <p className="text-[10px] text-slate-500">The RPC node didn't respond in time. This can happen during peak load.</p>
                <div className="flex gap-2">
                  <button
                    onClick={retryUpload}
                    className="px-3 py-1 rounded bg-orange-500/20 border border-orange-800/50 hover:bg-orange-500/30 text-[10px] font-medium text-orange-300 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={resetUpload}
                    className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-[10px] font-medium text-slate-400 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

            {errorType === 'blob-encoding' && (
              <div className="p-3 rounded-lg border border-red-900/30 bg-red-950/10 flex flex-col gap-2">
                <p className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Blob encoding failed</p>
                <p className="text-[10px] text-slate-500">The encrypted file couldn't be encoded for Walrus storage. Try a smaller file or different format.</p>
                <button
                  onClick={resetUpload}
                  className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-[10px] font-medium text-slate-400 transition-colors"
                >
                  Start over
                </button>
              </div>
            )}

            {/* Unknown error: generic retry + start over */}
            {errorType === 'unknown' && (
              <div className="flex gap-2">
                <button
                  onClick={retryUpload}
                  className="px-3 py-1 rounded bg-red-950/40 border border-red-800/50 hover:bg-red-900/40 text-[10px] font-medium text-red-300 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={resetUpload}
                  className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-[10px] font-medium text-slate-400 transition-colors"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Upload Button or Wallet Connect Guard */}
        {step === 'selected' ? (
          account ? (
            <Button
              onClick={executeUpload}
              className="w-full text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all duration-200 active:translate-y-[1px]"
            >
              Encrypt & Upload
            </Button>
          ) : (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <p className="text-xs text-slate-400 text-center">
                A connected Sui wallet is required to pay for gas and register storage.
              </p>
              <div className="flex justify-center">
                <WalletButton />
              </div>
            </div>
          )
        ) : null}

        {/* Done / Share Link */}
        {step === 'done' && shareLink ? (
          <div className="space-y-3">
            <Alert className="border-emerald-900/40 bg-emerald-950/20 text-emerald-400 text-xs py-2.5">
              <Check className="h-3.5 w-3.5" />
              <AlertDescription>Upload complete! Share this link with anyone.</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="bg-slate-800/50 border-slate-700 text-xs font-mono truncate h-9 placeholder:text-slate-600"
              />
              <Button
                onClick={() => { handleCopy(); }}
                size="sm"
                variant="outline"
                className="shrink-0 border-slate-700 hover:bg-slate-800 active:translate-y-[1px] transition-all h-9"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 hover:decoration-slate-500 transition-colors"
              >
                Open link
              </a>
              <span className="text-slate-800">·</span>

              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                {/* Trigger handled by wrapping element */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setQrDialogOpen(true)}
                    className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 hover:decoration-slate-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="h-3 w-3" />
                    Show QR Code
                  </button>
                </div>
                <DialogContent className="border-slate-800 bg-slate-950 max-w-xs p-6 flex flex-col items-center text-center">
                  <DialogHeader className="gap-1 items-center">
                    <DialogTitle className="text-sm font-semibold text-slate-100">
                      Scan QR Code
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Scan to download directly on mobile
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 p-3 bg-[#090d16] border border-slate-800 rounded-xl flex items-center justify-center">
                    {shareLink && (
                      <QRCodeSVG
                        value={shareLink}
                        size={180}
                        bgColor="#090d16"
                        fgColor="#10b981"
                        level="M"
                        includeMargin={true}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <span className="text-slate-800">·</span>
              <button
                onClick={resetUpload}
                className="text-xs text-slate-500 hover:text-slate-300 underline decoration-slate-700 hover:decoration-slate-500 transition-colors"
              >
                Upload another file
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
