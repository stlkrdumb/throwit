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
        const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider transition-all duration-100 cursor-pointer border-2 border-black';
        const style = action.variant === 'secondary'
          ? 'bg-card text-foreground shadow-[2px_2px_0_var(--color-secondary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)]'
          : 'bg-destructive text-white shadow-[2px_2px_0_var(--color-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-primary)]';
        return (
          <button key={action.label} onClick={action.onClick} className={`${base} ${style}`}>
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
            className="text-destructive font-bold underline hover:text-red-700"
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
    'walrus-nodes-error': {
      title: 'Walrus Node Connection Error',
      description: (
        <>
          Many Walrus node operators on mainnet have expired or misconfigured SSL certificates on port 9185, which browser security blocks. 
          Please switch to <strong>Tatum Gasless Mode</strong> in the header or footer to upload files using Tatum's server-side storage publisher.
        </>
      ),
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

  return (
    <div className="p-3 rounded-[4px] border-3 border-black bg-card flex flex-col gap-2 shadow-[4px_4px_0_var(--color-secondary)]">
      <p className="text-[10px] font-black text-destructive uppercase tracking-wider">{panel.title}</p>
      <p className="text-[10px] font-mono text-foreground font-semibold leading-relaxed">{panel.description}</p>
      <RecoveryActions actions={panel.actions} />
    </div>
  );
}