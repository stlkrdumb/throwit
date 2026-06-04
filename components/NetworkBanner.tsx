'use client';

import { config } from '@/lib/config';

export function NetworkBanner() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-mono font-medium text-yellow-500 backdrop-blur-md shadow-lg shadow-black/20">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
      DEV MODE · {config.network.toUpperCase()}
    </div>
  );
}
