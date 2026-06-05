'use client';

import { useEffect, useRef } from 'react';
import { LandingCTA } from '@/components/LandingCTA';
import { Shield, HardDrive, Key, Share2, ArrowRight, Coins, EyeOff } from 'lucide-react';

export default function Home() {
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // scroll hint cue if needed
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-background flex flex-col justify-center py-16 md:py-24">
      {/* Decorative geometric shapes — NO blurs, solid fills */}
      <div className="absolute top-[8%] left-[4%] h-28 w-28 rounded-[4px] bg-primary border-3 border-black shadow-[4px_4px_0_var(--color-secondary)] -rotate-12 pointer-events-none" />
      <div className="absolute bottom-[12%] right-[6%] h-32 w-32 rounded-full bg-accent border-3 border-black shadow-[4px_4px_0_#FFAB40] pointer-events-none" />
      <div className="absolute top-[45%] right-[12%] h-20 w-20 bg-[#4CAF50] border-3 border-black shadow-[3px_3px_0_#4CAF50] rounded-[4px] -rotate-45 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-14">
        {/* Hero Copy */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground leading-none uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Throw your files.<br />
            <span className="text-primary">
              Keep your secrets.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground leading-relaxed max-w-2xl mx-auto font-bold font-body">
            Encrypt files locally using AES-256-GCM. Share secure links with decryption keys stored solely in the URL hash fragment.
          </p>
        </div>

        {/* CTA Row */}
        <div className="flex flex-col items-center gap-4">
          <LandingCTA />

          {/* Scroll-down cue — bold arrow */}
          <div className="flex flex-col items-center gap-1 text-foreground mt-2">
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* How it works */}
        <div className="w-full">
          <div className="text-left mb-6">
            <h2 className="text-base font-black text-primary tracking-widest uppercase">How It Works</h2>
            <p className="text-lg font-black text-foreground mt-0.5 uppercase">End-to-End Browser Encryption Flow</p>
          </div>

          <div
            ref={flowRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-[4px] border-3 border-black bg-card relative overflow-hidden shadow-[6px_6px_0_var(--color-secondary)]"
          >
            {[
              {
                step: '01',
                icon: Shield,
                title: 'Encrypt',
                desc: 'AES-256-GCM encryption in-browser prior to sending.',
              },
              {
                step: '02',
                icon: HardDrive,
                title: 'Store',
                desc: 'File payload is split and written to Walrus storage.',
              },
              {
                step: '03',
                icon: Share2,
                title: 'Share',
                desc: 'Generate link where decryption keys live in hash fragments.',
              },
              {
                step: '04',
                icon: Key,
                title: 'Decrypt',
                desc: "Receiver's browser retrieves and decrypts the bytes.",
              },
            ].map((item, index) => (
              <div key={item.step} className="group flex flex-col gap-3 text-left p-4 rounded-[4px] border-2 border-black bg-muted hover:bg-secondary transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_var(--color-secondary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_var(--color-secondary)] shadow-[2px_2px_0_var(--color-secondary)] cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-[4px] bg-primary border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] text-black">
                    <item.icon className="h-5 w-5 text-black" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary tracking-wider">{item.step}</span>
                    <h3 className="text-sm font-black text-foreground group-hover:text-black uppercase">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-black font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4 text-left">
          {[
            {
              icon: EyeOff,
              title: 'Zero-Knowledge Security',
              desc: 'Decryption keys never leave your browser tab. We never see, touch, or store your passwords or plaintext files.',
            },
            {
              icon: Coins,
              title: 'Reclaim Storage Deposits',
              desc: 'Delete files on-chain when they are no longer needed and reclaim your locked WAL storage staking deposits instantly.',
            },
            {
              icon: HardDrive,
              title: 'Powered by Walrus',
              desc: 'Leverages decentralized storage blobs ensuring rapid delivery, extreme redundancy, and cost-effective hosting.',
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="p-5 rounded-[4px] border-3 border-black bg-card flex flex-col gap-3.5 shadow-[6px_6px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-primary)] transition-all duration-100"
              style={{
                borderTop: idx === 0 ? '8px solid var(--color-primary)' : idx === 1 ? '8px solid #4CAF50' : '8px solid var(--color-accent)',
              }}
            >
              <div className="h-9 w-9 rounded-[4px] border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] bg-secondary text-black">
                <item.icon className="h-4.5 w-4.5 text-black" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase tracking-wider text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

