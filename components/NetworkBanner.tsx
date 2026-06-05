'use client';

import { config } from '@/lib/config';

export function NetworkBanner() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--neo-radius-sm)] border-2 border-black bg-[var(--neo-yellow)] text-[10px] font-mono font-bold uppercase tracking-wide text-black neo-shadow-xs">
      <span className="h-1.5 w-1.5 rounded-sm bg-black animate-pulse" />
      DEV MODE · {config.network.toUpperCase()}
    </div>
  );
}
