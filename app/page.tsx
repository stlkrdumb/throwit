import { UploadWrapper } from '@/components/UploadWrapper';

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-100 leading-none">
          Send files. Encrypted.
        </h1>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          Upload any file — it gets encrypted in your browser before touching the network.
          Share a link. Recipients decrypt and download. No accounts, no subscriptions.
          Powered by Walrus on Sui.
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800/60" />

      {/* Upload Card */}
      <section>
        <UploadWrapper />
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'Encrypt locally',
              desc: 'Your file is encrypted with AES-256-GCM in the browser using Web Crypto. The server never sees plaintext.',
            },
            {
              step: '02',
              title: 'Store on Walrus',
              desc: 'The encrypted blob goes to Walrus — decentralized storage on Sui. Available for 1h, 3h, 1d, or 3d.',
            },
            {
              step: '03',
              title: 'Share & download',
              desc: 'A shareable link contains the encrypted blob ID and decryption key (in the URL fragment). Recipients decrypt instantly.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-2"
            >
              <span className="text-xs font-mono text-emerald-400/70">{item.step}</span>
              <h3 className="text-sm font-medium text-slate-200">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech badges */}
      <section className="flex items-center gap-4 pt-2 pb-8">
        {['Walrus', 'Sui', 'Tatum', 'Next.js 16'].map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 rounded-full bg-slate-800/50 text-xs font-mono text-slate-500 border border-slate-800"
          >
            {tech}
          </span>
        ))}
      </section>
    </div>
  );
}
