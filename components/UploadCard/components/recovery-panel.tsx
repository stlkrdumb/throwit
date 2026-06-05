'use client';

import { RotateCw, ArrowLeftRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UploadErrorType } from '@/hooks/useFileUpload';

interface RecoveryAction {
  label: string;
  icon: typeof RotateCw;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface RecoveryPanelProps {
  errorType: UploadErrorType;
  errorMessage?: string | null;
  onRetry: () => void;
  onReset: () => void;
}

function RecoveryActions({ actions }: { actions: RecoveryAction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const base = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--neo-radius-sm)] text-[10px] font-bold uppercase tracking-wide transition-all';
        const style = action.variant === 'secondary'
          ? `border-[2px] border-slate-700 hover:-translate-y-[1px] text-[var(--neo-text-muted)]` + ` bg-transparent`
          : 'border-[2px] border-black bg-[var(--neo-red)] text-white hover:-translate-y-[1px]';
        const shadow = action.variant === 'secondary' ? '' : ` neo-button-like`;
        return (
          <button key={action.label} onClick={action.onClick} className={`${base} ${style} ${shadow}`}>
            <Icon className="h-3 w-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export function RecoveryPanel({ errorType, errorMessage, onRetry, onReset }: RecoveryPanelProps) {
  const panels: Record<UploadErrorType, { title: string; description: ReactNode; actions: RecoveryAction[] } | null> = {
    'wallet-rejected': {
      title: 'Transaction Rejected',
      description: 'Your wallet denied the transaction. Make sure you\'re using the correct network and try again.',
      actions: [
        { label: 'Try Again', icon: RotateCw, onClick: onRetry },
        { label: 'Start Over', icon: ArrowLeftRight, onClick: onReset, variant: 'secondary' },
      ],
    },
    'insufficient-funds': {
      title: 'Insufficient Funds',
      description: (
        <>
          You need SUI in your wallet to pay for gas and storage staking. Get testnet SUI from the{' '}
          <a
            href="https://faucet.sui.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-300 underline decoration-red-800 hover:decoration-red-600"
          >
            Sui faucet
          </a>.
        </>
      ),
      actions: [
        { label: 'Start Over', icon: ArrowLeftRight, onClick: onReset, variant: 'secondary' },
      ],
    },
    'network-timeout': {
      title: 'Network Error',
      description: 'The RPC node didn\'t respond in time. This can happen during peak load.',
      actions: [
        { label: 'Retry', icon: RotateCw, onClick: onRetry },
        { label: 'Start Over', icon: ArrowLeftRight, onClick: onReset, variant: 'secondary' },
      ],
    },
    'blob-encoding': {
      title: 'Blob Encoding Failed',
      description: 'The encrypted file couldn\'t be encoded for Walrus storage. Try a smaller file or different format.',
      actions: [
        { label: 'Start Over', icon: ArrowLeftRight, onClick: onReset, variant: 'secondary' },
      ],
    },
    unknown: null, // handled generically
  };

  // Unknown error: generic retry + start over
  if (errorType === 'unknown' || !panels[errorType]) {
    return (
      <RecoveryActions
        actions={[
          { label: 'Retry', icon: RotateCw, onClick: onRetry },
          { label: 'Start Over', icon: ArrowLeftRight, onClick: onReset, variant: 'secondary' },
        ]}
      />
    );
  }

  const panel = panels[errorType]!;
  const borderMap = {
    'wallet-rejected': 'border-amber-900/30',
    'insufficient-funds': 'border-red-900/30',
    'network-timeout': 'border-orange-900/30',
    'blob-encoding': 'border-red-900/30',
    unknown: 'border-slate-700',
  };

  const bgMap = {
    'wallet-rejected': 'bg-amber-950/10',
    'insufficient-funds': 'bg-red-950/10',
    'network-timeout': 'bg-orange-950/10',
    'blob-encoding': 'bg-red-950/10',
    unknown: 'bg-slate-950/40',
  };

  return (
    <div className={`p-3 rounded-[var(--neo-radius-md)] border-[var(--neo-border-bold)] ${borderMap[errorType]} ${bgMap[errorType]} flex flex-col gap-2 neo-shadow-sm`}>
      <p className="text-[10px] font-bold text-[var(--neo-red)] uppercase tracking-wider">{panel.title}</p>
      <p className="text-[10px] font-mono text-[var(--neo-text-muted)]">{panel.description}</p>
      <RecoveryActions actions={panel.actions} />
    </div>
  );
}