'use client';

import { useEffect, useRef } from 'react';
import { LandingCTA } from '@/components/LandingCTA';
import { Sponsor } from '@/components/Sponsor';
import {
  Shield,
  HardDrive,
  Key,
  Share2,
  ArrowRight,
  Coins,
  EyeOff,
  FolderArchive,
  Zap,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const flowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-background flex flex-col justify-center py-12 md:py-20">
      {/* Decorative geometric shapes — NO blurs, flat colors, bold borders */}
      <div className="absolute top-[6%] left-[4%] h-24 w-24 rounded-[4px] bg-primary border-3 border-black shadow-[4px_4px_0_var(--color-secondary)] -rotate-12 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-[10%] right-[4%] h-28 w-28 rounded-full bg-accent border-3 border-black shadow-[4px_4px_0_#000] pointer-events-none hidden sm:block" />
      <div className="absolute top-[40%] right-[8%] h-16 w-16 bg-[#4CAF50] border-3 border-black shadow-[3px_3px_0_#000] rounded-[4px] -rotate-45 pointer-events-none hidden md:block" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-14 md:gap-20">
        
        {/* HERO SECTION */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border-2 border-black bg-secondary text-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0_#000]">
            <Zap className="h-3.5 w-3.5 fill-black" />
            Next-Gen Decentralized File Sharing
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[0.95] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            Throw your files.<br />
            <span className="text-primary bg-black px-2 py-0.5 inline-block -rotate-1 border-2 border-black shadow-[4px_4px_0_var(--color-secondary)] my-2">
              Keep your secrets.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground leading-relaxed max-w-2xl mx-auto font-bold font-body">
            Encrypt files client-side using AES-256-GCM. Share secure links where decryption keys reside solely in the URL hash fragment. Powered by Walrus storage.
          </p>
        </div>

        {/* CTA ROW */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <LandingCTA />
            <Sponsor />
          </div>
          
          <div className="flex items-center gap-6 mt-2 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#4CAF50] fill-black" /> 100% Zero-Knowledge</span>
            <span className="hidden sm:inline-block">·</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[#4CAF50] fill-black" /> No Size Limits</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-foreground mt-4">
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* WORKFLOW revamps: Dual Upload Mode Flexibility */}
        <div className="w-full text-left space-y-6">
          <div>
            <h2 className="text-xs font-black text-primary tracking-widest uppercase">Flexibility</h2>
            <p className="text-xl md:text-2xl font-black text-foreground mt-0.5 uppercase">Choose Your Transfer Strategy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode 1: Gasless Tatum Mode */}
            <div className="group rounded-[4px] border-3 border-black bg-card p-6 shadow-[6px_6px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-primary)] transition-all duration-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-[4px] bg-[#FFAB40] border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] text-black">
                    <Zap className="h-5 w-5 fill-black" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-secondary text-black px-2 py-0.5 rounded-[4px] border border-black uppercase tracking-wide">NO WALLET REQUIRED</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Tatum Gasless Mode</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Upload and transfer files instantly without wallet approvals or signature prompts. Authentication and network transactions are handled gaslessly via the Tatum RPC infrastructure.
                  </p>
                </div>
                <ul className="text-xs font-mono space-y-1.5 text-foreground pt-2">
                  <li className="flex items-center gap-2">✓ <a href="https://dashboard.tatum.io/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors font-bold">Register Tatum Account (FREE 100k Credits)</a></li>
                  <li className="flex items-center gap-2">✓ Enter Tatum API Key to begin</li>
                  <li className="flex items-center gap-2">✓ No signature popups or gas fees</li>
                  <li className="flex items-center gap-2">✓ Local E2E browser encryption</li>
                </ul>
              </div>
            </div>

            {/* Mode 2: On-chain Mode */}
            <div className="group rounded-[4px] border-3 border-black bg-card p-6 shadow-[6px_6px_0_var(--color-secondary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-secondary)] transition-all duration-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-[4px] bg-secondary border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] text-black">
                    <Coins className="h-5 w-5 text-black" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-[4px] border border-black uppercase tracking-wide">FULL CONTROL</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Sui On-Chain Mode</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    Connect your Sui wallet to directly sponsor storage epochs. This grants you complete self-custody over metadata and lets you claim a full staking refund when you delete files.
                  </p>
                </div>
                <ul className="text-xs font-mono space-y-1.5 text-foreground pt-2">
                  <li className="flex items-center gap-2">✓ Connect any standard Sui wallet</li>
                  <li className="flex items-center gap-2">✓ Pay low storage deposit fees on-chain</li>
                  <li className="flex items-center gap-2">✓ Reclaim storage stake when files are deleted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW: ZIP Compression */}
        <div className="w-full text-left space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-black text-primary tracking-widest uppercase">Client-Side Compression</h2>
              <p className="text-xl md:text-2xl font-black text-foreground mt-0.5 uppercase">Multi-File & Folder Bundles</p>
            </div>
          </div>

          <div className="rounded-[4px] border-3 border-black bg-card p-6 shadow-[6px_6px_0_var(--color-secondary)] relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-sm font-bold text-foreground leading-relaxed">
                  No need to upload files one by one. Drag and drop multiple files or entire folder hierarchies directly into the upload area. 
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our application instantly packages your directory structures into a single compressed <code className="bg-muted px-1.5 py-0.5 border border-black rounded-[2px] text-foreground font-mono font-semibold">.zip</code> archive directly in your browser. This zipped pack is encrypted before it leaves your machine, ensuring file names and folder structures remain private.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-sm border-2 border-black bg-muted text-[10px] font-mono font-bold text-foreground shadow-[2px_2px_0_#000]">In-Browser Zipping</span>
                  <span className="px-2.5 py-1 rounded-sm border-2 border-black bg-muted text-[10px] font-mono font-bold text-foreground shadow-[2px_2px_0_#000]">Keeps Filenames Secret</span>
                  <span className="px-2.5 py-1 rounded-sm border-2 border-black bg-muted text-[10px] font-mono font-bold text-foreground shadow-[2px_2px_0_#000]">Retains Folders Hierarchy</span>
                </div>
              </div>
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[280px] p-4 rounded-[4px] border-3 border-black bg-muted text-foreground shadow-[4px_4px_0_#000] rotate-2">
                  <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
                    <FolderArchive className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-xs font-mono font-black truncate">local-bundle.zip</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground">
                    <div className="flex justify-between"><span>📁 project_assets/</span><span>[Folder]</span></div>
                    <div className="flex justify-between pl-3"><span>📄 logo.svg</span><span>24 KB</span></div>
                    <div className="flex justify-between pl-3"><span>📄 readme.md</span><span>4 KB</span></div>
                    <div className="flex justify-between"><span>📄 config.json</span><span>1 KB</span></div>
                  </div>
                  <div className="mt-3 pt-2 border-t-2 border-dashed border-black/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground font-semibold">
                    <span>Overall Size:</span>
                    <span className="bg-secondary px-1.5 py-0.5 rounded border border-black text-black">29 KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div className="w-full text-left space-y-6">
          <div>
            <h2 className="text-xs font-black text-primary tracking-widest uppercase">The Pipeline</h2>
            <p className="text-xl md:text-2xl font-black text-foreground mt-0.5 uppercase">How Encryption & Storage Work</p>
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
                desc: 'Generates a unique AES-256-GCM key inside your browser tab to encrypt file bytes locally.',
              },
              {
                step: '02',
                icon: HardDrive,
                title: 'Store',
                desc: 'Encrypt payload is split and distributed securely onto decentralized Walrus storage nodes.',
              },
              {
                step: '03',
                icon: Share2,
                title: 'Share',
                desc: 'Constructs download link. Decryption key lives in the URL hash, never uploaded online.',
              },
              {
                step: '04',
                icon: Key,
                title: 'Decrypt',
                desc: "Recipient's browser reads the hash fragment locally and reconstructs the original file bytes.",
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
                    <span className="text-xs font-black text-primary group-hover:text-black tracking-wider">{item.step}</span>
                    <h3 className="text-sm font-black text-foreground group-hover:text-black uppercase">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-black font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CORE FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            {
              icon: EyeOff,
              title: 'Zero-Knowledge Security',
              desc: 'Decryption keys never leave your browser tab. We never see, touch, or store your passwords or plaintext files.',
              color: 'var(--color-primary)',
            },
            {
              icon: Coins,
              title: 'Reclaim Storage Deposits',
              desc: 'Delete files on-chain when they are no longer needed and reclaim your locked WAL storage staking deposits instantly.',
              color: '#4CAF50',
            },
            {
              icon: HardDrive,
              title: 'Powered by Walrus',
              desc: 'Leverages decentralized storage blobs ensuring rapid delivery, extreme redundancy, and cost-effective hosting.',
              color: 'var(--color-accent)',
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="p-5 rounded-[4px] border-3 border-black bg-card flex flex-col gap-3.5 shadow-[6px_6px_0_var(--color-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_var(--color-primary)] transition-all duration-100"
              style={{
                borderTop: `8px solid ${item.color}`,
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
