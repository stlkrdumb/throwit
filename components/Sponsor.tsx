'use client';

import { ExternalLink } from 'lucide-react';

export function Sponsor() {
  return (
    <a
      href="https://dashboard.tatum.io/signup"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[4px] bg-yellow-400 text-black border-3 border-black text-sm font-bold uppercase tracking-wide transition-all duration-100 cursor-pointer select-none shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000]"
    >
      <span>Register Tatum (Free 100k Credits)</span>
      <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-black" />
    </a>
  );
}
