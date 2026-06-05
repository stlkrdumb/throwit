'use client';

import { useEffect, useRef } from 'react';
import { LandingCTA } from '@/components/LandingCTA';
import { Shield, HardDrive, Key, Share2, ArrowRight, Coins, EyeOff } from 'lucide-react';

export default function Home() {
  const flowRef = useRef<HTMLDivElement>(null);

  // Scroll into view when "How it works" is clicked or after a brief delay for scroll cue visibility
  useEffect(() => {
    // Show scroll indicator briefly, then hint at the section below
    const timer = setTimeout(() => {
      // subtle: flash the "scroll down" cue once so users know content continues
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-[var(--neo-cream)] flex flex-col justify-center py-16 md:py-24">
      {/* Decorative geometric shapes — NO blurs, solid fills */}
      <div className="absolute top-[8%] left-[4%] h-28 w-28 rounded-[var(--neo-radius-md)] bg-[var(--neo-pink)] border-[3px] border-black neo-shadow-sm -rotate-12 pointer-events-none" />
      <div className="absolute bottom-[12%] right-[6%] h-32 w-32 rounded-full bg-[var(--neo-cyan)] border-[3px] border-black neo-shadow-sm pointer-events-none" />
      <div className="absolute top-[45%] right-[12%] h-20 w-20 rounded-sm bg-[var(--neo-lime)] border-[3px] border-black neo-shadow-xs -rotate-45 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-14">
        {/* Hero Copy */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-[var(--neo-text-primary)] leading-none uppercase" style={{ fontFamily: 'var(--font-neo-display)' }}>
            Throw your files.<br />
            <span className="text-[var(--neo-red)]">
              Keep your secrets.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--neo-text-muted)] leading-relaxed max-w-2xl mx-auto font-medium" style={{ fontFamily: 'var(--font-neo-body)' }}>
            ENCRYPT FILES LOCALLY USING AES-256-GCM. SHARE SECURE LINKS WITH DECRYPTION KEYS STORED SOLELY IN THE URL HASH FRAGMENT.
          </p>
        </div>

        {/* CTA Row */}
        <div className="flex flex-col items-center gap-4">
          <LandingCTA />

          {/* Scroll-down cue — bold arrow, NO animation dependency */}
          <div className="flex flex-col items-center gap-1 text-[var(--neo-text-muted)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* How it works */}
        <div className="w-full">
          <div className="text-left mb-6">
            <h2 className="text-xs font-black text-[var(--neo-pink)] tracking-wider uppercase" style={{ fontFamily: 'var(--font-neo-display)' }}>How It Works</h2>
            <p className="text-sm font-bold text-[var(--neo-text-primary)] mt-0.5 uppercase">End-to-End Browser Encryption Flow</p>
          </div>

          <div
            ref={flowRef}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 rounded-[var(--neo-radius-md)] border-[3px] border-black bg-white relative overflow-hidden neo-shadow-lg"
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
              <div key={item.step} className="flex flex-col gap-3 relative text-left p-4 rounded-[var(--neo-radius-sm)] border-2 border-slate-200 hover:border-black transition-all neo-hover-lift">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-[var(--neo-radius-sm)] bg-[var(--neo-pink)] border-3 border-black flex items-center justify-center neo-shadow-sm">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden sm:block h-5 w-5 text-[var(--neo-text-muted)] absolute right-[-18%] top-1/2 -translate-y-1/2 font-black" style={{ fontFamily: 'var(--font-neo-display)' }} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--neo-text-primary)] flex items-center gap-1.5 uppercase">{item.title}</h3>
                  <p className="text-[11px] text-[var(--neo-text-muted)] mt-1 leading-relaxed">{item.desc}</p>
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
              className="p-5 rounded-[var(--neo-radius-md)] border-[3px] border-black bg-white flex flex-col gap-3.5 neo-shadow-lg hover:-translate-y-[2px] transition-all duration-100"
              style={{
                borderTop: idx === 0 ? '6px solid var(--neo-pink)' : idx === 1 ? '6px solid var(--neo-lime)' : '6px solid var(--neo-cyan)',
              }}
            >
              <div className="h-9 w-9 rounded-[var(--neo-radius-sm)] border-3 border-black flex items-center justify-center neo-shadow-sm bg-[var(--neo-yellow)]">
                <item.icon className="h-4.5 w-4.5 text-black" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wide text-[var(--neo-text-primary)]">{item.title}</h4>
                <p className="text-[11px] text-[var(--neo-text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
