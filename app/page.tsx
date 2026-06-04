import { LandingCTA } from '@/components/LandingCTA';
import { Shield, HardDrive, Key, Share2, ArrowRight, Coins, EyeOff } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-69px)] w-full overflow-hidden bg-slate-950 flex flex-col justify-center py-16 md:py-24">
      {/* Decorative ambient auras */}
      <div className="absolute top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none" />
      
      {/* Grid overlay for tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-12">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sui Testnet · Hackathon Project
        </div>

        {/* Hero Copy */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-100 leading-none">
            Throw your files.<br />
            <span className="text-emerald-400" style={{ textShadow: "0 0 8px rgba(16, 185, 129, 0.35)" }}>
              Keep your secrets.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Encrypt files locally using AES-256-GCM. Share secure links with decryption keys stored solely in the URL hash fragment.
          </p>
        </div>

        {/* Interactive CTA */}
        <div className="flex flex-col items-center">
          <LandingCTA />
        </div>

        {/* Step Flowchart */}
        <div className="w-full mt-8">
          <div className="text-left mb-6">
            <h2 className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">How it works</h2>
            <p className="text-sm text-slate-300 font-medium mt-0.5">End-to-End browser encryption flow</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 rounded-2xl border border-slate-900 bg-slate-900/10 backdrop-blur-md relative overflow-hidden">
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
                desc: 'Receiver’s browser retrieves and decrypts the bytes.',
              },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col gap-3 relative text-left">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <item.icon className="h-4.5 w-4.5 text-emerald-400" />
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden sm:block h-4 w-4 text-slate-800 absolute right-[-14%] top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="text-xs font-mono text-emerald-500/70">{item.step}</span>
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
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
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl border border-slate-900 bg-slate-950 hover:border-slate-800/80 transition-colors duration-200 flex flex-col gap-3.5"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
