# Decentralized File Transfer on Walrus + Sui — Implementation Plan

## Project Overview

**Name suggestion:** `throwit` (working title)

**Goal:** A WeTransfer-style web app where users upload files, get a shareable link, and recipients can download the file — but fully decentralized using Walrus (storage) + Sui (blockchain) + Tatum (RPC infrastructure). All file content is client-side encrypted so the operator never sees plaintext.

**Why this wins the hackathon:**
- Walrus is the *core* of the product (not an add-on) → strong integration score
- Clear, instantly understandable demo (drop file → share link → download)
- Real differentiators vs. WeTransfer: E2E encryption, no subscription, no size cap
- Polished MVP beats ambitious broken thing in 2 days

**Hackathon target categories:**
- Walrus Prize (any blob storage project qualifies)
- Best Use of Tatum Tools ($200)
- Mainnet Bonus
- X/LinkedIn sharing Bonus

---

## Tech Stack

| Layer | Tool | Version | Why |
|-------|------|---------|-----|
| Frontend | Next.js (App Router) + TypeScript | **16.2.7** (latest stable) | React 19, Turbopack default, ~4× faster builds vs 14 |
| Runtime | Node.js | **20.9+** (required by Next.js 16) | Vercel default already |
| Styling | Tailwind CSS + shadcn/ui | latest | Polished UI quickly |
| Wallet | `@mysten/dapp-kit` + `@mysten/sui` | latest | Sui wallet connection |
| Storage SDK | `@mysten/walrus` | latest | Official Walrus TypeScript SDK |
| Network (dev) | Sui **Testnet** | — | Free iteration, no real-money mistakes |
| Network (prod) | Sui **Mainnet** | — | Required for mainnet bonus |
| RPC | Tatum gateway (testnet or mainnet) | — | Qualifies for Tatum Tools prize |
| Encryption | Web Crypto API | built-in | No extra deps, native AES-GCM |
| File I/O | `react-dropzone` | latest | Drag-and-drop UI |
| Deploy | Vercel | — | Free, fast, perfect for Next.js |

**Why Next.js 16.2.7 specifically (not 14, not 15):**
- **Turbopack is the default** → ~4× faster builds, ~10× faster Fast Refresh — critical for 2-day iteration cycles
- **React 19.2 + stable React Compiler** → automatic memoization, less boilerplate
- **Async `params`/`searchParams`** → matches modern React Server Components patterns
- **May 2026 security patches included** (16.2.6/16.2.7)
- **Months of stability patches** since initial v16 release
- **AI coding agents are trained on more recent patterns** than v14

---

## Environment Strategy

| Environment | Network | RPC | Use Case |
|-------------|---------|-----|----------|
| `development` (local) | Sui **Testnet** | Tatum testnet gateway | Day-to-day dev, free SUI/WAL from faucets |
| `preview` (Vercel PR previews) | Sui **Testnet** | Tatum testnet gateway | Demo to teammates without burning real tokens |
| `production` (Vercel main) | Sui **Mainnet** | Tatum mainnet gateway | Live demo, submission, judging |

### Faucets (fund BEFORE you start coding)
- **Sui Testnet SUI:** https://faucet.sui.io/ (Discord-verified) or `#testnet-faucet` Discord channel
- **Walrus Testnet WAL:** https://faucet.wal.app/ (or testnet variant — confirm in Walrus docs at dev time)
- **Slush Wallet** is the cleanest Sui wallet for testing because it lets you switch networks in one click

### Cross-network link safety
- A share link is implicitly tied to the deployment. Testnet-deployed URL → testnet blobs only. Mainnet-deployed URL → mainnet blobs only. No special code needed.
- Do NOT mix networks (e.g., upload on testnet, share link to a mainnet user) — the download will fail because the blob won't exist on the receiving network.

---

## File Structure

```
throwit/
├── app/
│   ├── layout.tsx              # Root layout, wallet provider wrapper
│   ├── page.tsx                # Landing/upload page (home)
│   ├── d/
│   │   └── [blobId]/
│   │       └── page.tsx        # Download page (reads URL fragment, decrypts)
│   └── api/
│       └── tatum-proxy/        # (optional) proxy Tatum calls if needed
│           └── route.ts
├── components/
│   ├── UploadCard.tsx          # Drag-drop upload UI
│   ├── WalletButton.tsx        # dapp-kit connect button
│   ├── ShareLinkDialog.tsx     # Shows link + copy button after upload
│   ├── ExpirySelector.tsx      # 1h / 1d / 3d / 7d picker
│   └── NetworkBanner.tsx       # DEV MODE badge showing current network
├── lib/
│   ├── config.ts               # Network-aware config (THE source of truth)
│   ├── crypto.ts               # AES-GCM encrypt/decrypt with Web Crypto
│   ├── walrus.ts               # Walrus upload/download/delete helpers
│   ├── sui.ts                  # Tatum RPC helpers, Sui client setup
│   └── link.ts                 # URL fragment encoding helpers
├── public/
│   └── og-image.png            # Open Graph image for share previews
├── .env.local                  # Testnet config (gitignored)
├── .env.production             # Mainnet config (committed, public values only)
├── .env.local.example          # Template for teammates
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json               # target: ES2022+, module: bundler
└── README.md                   # Demo, architecture, cost comparison
```

---

## Environment Variables

### `.env.local.example` (commit this, then devs copy to `.env.local`)
```bash
# Testnet — used in development
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_TATUM_RPC=https://sui-testnet.gateway.tatum.io
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.testnet.walrus.site
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `.env.production` (committed — only public values)
```bash
# Mainnet — used in production builds
NEXT_PUBLIC_SUI_NETWORK=mainnet
NEXT_PUBLIC_TATUM_RPC=https://sui-mainnet.gateway.tatum.io
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus.site
NEXT_PUBLIC_APP_URL=https://throwit.xyz
```

### `.gitignore`
```
.env.local
.env.*.local
```

### Vercel Environment Variables
Set in Project Settings → Environment Variables:
- **Production**: values from `.env.production`
- **Preview**: values from `.env.local` (testnet) — saves real tokens on PR previews

---

## Data Flow

### Upload Flow
1. User selects file via drag-drop or file picker
2. Browser generates a random AES-GCM 256-bit key (Web Crypto API)
3. File is read as `ArrayBuffer` via `FileReader`
4. File is encrypted client-side: `encrypt(plaintext, key)` → `ciphertext + iv`
5. User picks expiry: 1h / 1d / 3d / 7d (converted to Walrus epochs)
6. Encrypted blob uploaded to Walrus via `client.walrus.writeBlob({ blob: ciphertext, epochs, deletable: true, signer })`
7. Browser constructs share link: `https://throwit.xyz/d/{blobId}#{base64url(key)}#{base64url(iv)}`
   - Note: URL fragment (`#...`) is never sent to any server, so the key stays client-only
8. User copies link from `ShareLinkDialog`

### Download Flow
1. Recipient opens `https://throwit.xyz/d/{blobId}#key.iv.filename`
2. Page reads `key`, `iv`, and `filename` from `window.location.hash`
3. Page calls `client.walrus.readBlob({ blobId })` → returns `ciphertext`
4. Page decrypts: `decrypt(ciphertext, key, iv)` → returns plaintext `ArrayBuffer`
5. Page triggers browser download via `URL.createObjectURL(blob)` + `<a download>` click
6. Show original filename (from URL fragment)

---

## Implementation Details

### 1. Environment Setup

**Requirements:** Node.js 20.9+ (check with `node -v`)

```bash
npx create-next-app@latest throwit --typescript --tailwind --app --no-src-dir
cd throwit
```

If already on throwit folder, initialize next.js using . preventing creating multiple/nested throwit folder.

```bash
npm install @mysten/sui @mysten/walrus @mysten/dapp-kit @tanstack/react-query react-dropzone
cp .env.local.example .env.local   # then fill in if needed
```

**Next.js 16 notes:**
- Turbopack is the default dev bundler (no `--turbo` flag needed)
- `tsconfig.json` should have `target: "ES2022"` minimum, `module: "esnext"`
- Add `nodejs` to your Vercel project settings to ensure Node 20+

### 2. `lib/config.ts` — Single Source of Truth (CRITICAL)

```typescript
// Centralized config so we never accidentally hit mainnet in dev.

export const config = {
  network: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? 'testnet') as
    | 'testnet'
    | 'mainnet',
  rpc: process.env.NEXT_PUBLIC_TATUM_RPC!,
  aggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const;

// Safety check: log loudly if running mainnet in dev
if (process.env.NODE_ENV === 'development' && config.network === 'mainnet') {
  console.warn(
    '⚠️  Running in development mode on MAINNET. Consider switching to testnet.'
  );
}
```

### 3. `lib/crypto.ts` — Client-Side Encryption

```typescript
// All operations happen in the browser. No keys ever leave the client.

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable so we can put it in the URL fragment
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(
  file: File | ArrayBuffer,
  key: CryptoKey
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const data =
    file instanceof File ? new Uint8Array(await file.arrayBuffer()) : new Uint8Array(file);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return { ciphertext: new Uint8Array(cipherBuffer), iv };
}

export async function decryptFile(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return base64UrlEncode(new Uint8Array(raw));
}

export async function importKey(b64: string): Promise<CryptoKey> {
  const raw = base64UrlDecode(b64);
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt',
  ]);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
```

### 4. `lib/walrus.ts` — Storage Helpers (uses config)

```typescript
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrusrus } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { config } from './config';

export function getWalrusClient(signer: Ed25519Keypair) {
  return new SuiGrpcClient({
    network: config.network,
    baseUrl: config.rpc,
  }).$extend(walrus());
}

export async function uploadBlob(
  signer: Ed25519Keypair,
  blob: Uint8Array,
  epochs: number
): Promise<string> {
  const client = getWalrusClient(signer);
  const { blobId } = await client.walrus.writeBlob({
    blob,
    deletable: true,
    epochs,
    signer,
  });
  return blobId;
}

export async function downloadBlob(blobId: string): Promise<Uint8Array> {
  const client = new SuiGrpcClient({
    network: config.network,
    baseUrl: config.rpc,
  }).$extend(walrus());
  return new Uint8Array(await client.walrus.readBlob({ blobId }));
}

export async function deleteBlob(signer: Ed25519Keypair, blobId: string) {
  const client = getWalrusClient(signer);
  await client.walrus.executeDeleteBlobTransaction({ blobId, signer });
}
```

### 5. `lib/sui.ts` — Read Client (uses config)

```typescript
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';
import { config } from './config';

// Read-only client (for downloading without a signer)
export function getReadClient() {
  return new SuiGrpcClient({
    network: config.network,
    baseUrl: config.rpc,
  }).$extend(walrus());
}
```

### 6. `lib/link.ts` — URL Fragment Helpers (uses config)

```typescript
import { config } from './config';

// Pack: {blobId}#{base64url(key)}#{base64url(iv)}#{base64url(filename)}
// Network is implicit in the deployment → no need to encode in link.
// URL fragment is never sent to any server → keys stay client-side.

export function buildShareLink(
  blobId: string,
  keyB64: string,
  ivB64: string,
  filename: string
): string {
  const f = encodeURIComponent(filename);
  return `${config.appUrl}/d/${blobId}#${keyB64}.${ivB64}.${f}`;
}

export function parseShareLink(hash: string) {
  const parts = hash.replace(/^#/, '').split('.');
  if (parts.length !== 3) return null;
  return { key: parts[0], iv: parts[1], filename: decodeURIComponent(parts[2]) };
}
```

### 7. `components/NetworkBanner.tsx` — Visual Safety Net

```typescript
'use client';
import { config } from '@/lib/config';

export function NetworkBanner() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <div className="fixed bottom-3 right-3 bg-yellow-100 text-yellow-900 px-3 py-1 text-xs rounded shadow">
      DEV MODE — {config.network.toUpperCase()}
    </div>
  );
}
```

Add `<NetworkBanner />` once in `app/layout.tsx`.

### 8. `components/UploadCard.tsx` — Upload UI (sketch)

```typescript
'use client';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateKey, encryptFile, exportKey } from '@/lib/crypto';
import { uploadBlob } from '@/lib/walrus';
import { buildShareLink } from '@/lib/link';
import { ShareLinkDialog } from './ShareLinkDialog';

export function UploadCard() {
  const account = useCurrentAccount();
  const [file, setFile] = useState<File | null>(null);
  const [epochs, setEpochs] = useState(3);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => files[0] && setFile(files[0]),
    maxFiles: 1,
  });

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    try {
      // 1. Generate key + encrypt
      const key = await generateKey();
      const { ciphertext, iv } = await encryptFile(file, key);
      const keyB64 = await exportKey(key);
      const ivB64 = btoa(String.fromCharCode(...iv))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // 2. Upload to Walrus (uses connected wallet's signer or fallback keypair)
      const signer = /* your funded keypair or wallet signer */ null as any;
      const blobId = await uploadBlob(signer, ciphertext, epochs);

      // 3. Build share link
      setLink(buildShareLink(blobId, keyB64, ivB64, file.name));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed p-12 rounded-xl">
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drop file or click</p>}
      </div>
      <select value={epochs} onChange={(e) => setEpochs(+e.target.value)}>
        <option value={1}>1 day</option>
        <option value={3}>3 days</option>
        <option value={7}>7 days</option>
        <option value={30}>30 days</option>
      </select>
      <button onClick={handleUpload} disabled={!file || busy}>
        {busy ? 'Uploading…' : 'Upload'}
      </button>
      {link && <ShareLinkDialog link={link} />}
    </div>
  );
}
```

### 9. `app/d/[blobId]/page.tsx` — Download Page (sketch)

**⚠️ Next.js 16 note:** Dynamic route `params` is now a **Promise** that must be awaited/unwrapped.

```typescript
'use client';
import { useEffect, useState } from 'react';
import { use } from 'react'; // React 19 'use' hook
import { downloadBlob } from '@/lib/walrus';
import { decryptFile, importKey } from '@/lib/crypto';
import { parseShareLink } from '@/lib/link';

export default function DownloadPage({
  params,
}: {
  params: Promise<{ blobId: string }>;
}) {
  // Next.js 16: unwrap params Promise
  const { blobId } = use(params);
  const [status, setStatus] = useState('Decrypting…');

  useEffect(() => {
    (async () => {
      const parsed = parseShareLink(window.location.hash);
      if (!parsed) {
        setStatus('Invalid share link');
        return;
      }
      const ciphertext = await downloadBlob(blobId);
      const key = await importKey(parsed.key);
      const iv = Uint8Array.from(
        atob(parsed.iv.replace(/-/g, '+').replace(/_/g, '/')),
        (c) => c.charCodeAt(0)
      );
      const plaintext = await decryptFile(ciphertext, key, iv);
      const blob = new Blob([plaintext]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = parsed.filename;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Downloaded!');
    })();
  }, [blobId]);

  return <p>{status}</p>;
}
```

---

## Next.js 16 Breaking Changes — Quick Reference

| Change | What it means for throwit |
|--------|---------------------------|
| `params` and `searchParams` are now **Promises** | Use `use(params)` in client components, `await params` in async server components |
| **Node.js 20.9+ required** | Vercel default is Node 20+, but check your local env |
| **TypeScript 5+ required** | Default in `create-next-app` 16.x |
| **AMP support removed** | Not relevant to us |
| `middleware.ts` → `proxy.ts` (Node runtime only) | We don't use middleware → no impact |
| **Turbopack is the default** | `next dev` is already fast, no flag needed |
| **React 19.2 + stable React Compiler** | Auto-memoization, less manual `useMemo` |

---

## 2-Day Sprint Plan

### **Day 1 — Core Upload**
- [ ] Verify `node -v` is 20.9+
- [ ] `create-next-app@latest` + install deps (Turbopack starts immediately)
- [ ] `cp .env.local.example .env.local` — confirm testnet config
- [ ] Fund a testnet wallet with SUI + WAL from faucets
- [ ] `lib/config.ts` — single source of truth for network
- [ ] `lib/crypto.ts` — encryption helpers + tests
- [ ] `lib/walrus.ts` — uploadBlob using config.network
- [ ] `lib/link.ts` — build/parse share links
- [ ] `components/NetworkBanner.tsx` — visible safety net
- [ ] `components/UploadCard.tsx` — drag-drop + expiry selector
- [ ] `components/ShareLinkDialog.tsx` — show link + copy button
- [ ] Home page wired up; verify upload on **testnet** → blob appears on testnet Walrus explorer

### **Day 2 — Download + Polish + Submit**
- [ ] `app/d/[blobId]/page.tsx` — read fragment, fetch, decrypt, download (use `use(params)`)
- [ ] Connect dapp-kit wallet button (replace hardcoded keypair)
- [ ] Add "encrypt/decrypt" status toasts
- [ ] Polish landing page (hero, "how it works", Walrus explainer)
- [ ] Write README with cost-comparison table (Walrus vs Arweave vs S3)
- [ ] `npm run build` to verify production build works
- [ ] Set Vercel env vars: Production = mainnet, Preview = testnet
- [ ] Deploy to Vercel, test end-to-end on **mainnet**
- [ ] Record 2-min Loom demo
- [ ] Submit + post on X tagging @Tatum_io @WalrusFoundation @SuiNetwork

---

## README Sections (for hackathon submission)

1. **Demo GIF** (10 sec) — upload + share + download
2. **Why decentralized file transfer?** — WeTransfer holds your files, requires subscription, no E2E encryption
3. **How it works** — 3-step diagram (encrypt → upload to Walrus → share link)
4. **Architecture** — bullet list of components
5. **Cost comparison table:**

   | Service | 1 GB / 30 days | E2E Encrypted | Decentralized |
   |---------|----------------|---------------|---------------|
   | WeTransfer Pro | $13/mo + trust | ❌ | ❌ |
   | Arweave | ~$10 one-time | ❌ | ✅ |
   | Walrus (this app) | ~$0.01 | ✅ | ✅ |

6. **Mainnet proof** — link to a blob on `walruscan.com` or `walrus.site`
7. **Setup instructions** — `cp .env.local.example .env.local && npm install && npm run dev` (requires Node 20.9+)
8. **Environment notes** — dev uses Sui testnet (free faucets), production uses mainnet via `.env.production`
9. **Future roadmap** — paywall via Sui tx, multi-recipient, Seal threshold encryption, mobile app
10. **Team & credits** — Walrus docs, Tatum docs, Sui Discord

---

## Critical Reminders

- ✅ Use **Sui Mainnet** in production for mainnet bonus
- ✅ Use **Tatum RPC** for Tatum Tools prize
- ✅ Share progress on **X / LinkedIn** tagging @Tatum_io @WalrusFoundation @SuiNetwork for share bonus
- ✅ Ensure Walrus usage is **the core** of the app, not a side feature
- ✅ **Never mix networks** — a testnet blob cannot be fetched from a mainnet deployment
- ⚠️ **Node.js 20.9+** required for Next.js 16 — verify before coding
- ⚠️ **Async params** in dynamic routes — use `use(params)` in client components
- ⚠️ Fund a testnet wallet with **SUI + WAL** BEFORE the live demo
- ⚠️ If Vite/Next.js WASM errors: pass `wasmUrl` to the Walrus client
- ⚠️ For browser uploads: use `writeFilesFlow` with separate buttons to avoid popup blockers
- ⚠️ Test on a real phone on real WiFi — judges will test the link themselves

---

## Stretch Goals (only if time permits)

- [ ] Optional **SUI paywall** to unlock downloads (use Tatum RPC to submit tx)
- [ ] QR code generator for the share link
- [ ] Email-style "From / To / Message" field (stored in blob attributes)
- [ ] **Drag-to-upload-multiple** with zip auto-pack
- [ ] Show file size + cost in SUI on the upload card
- [ ] Server-side cleanup job to delete expired blobs

---

## Helpful Links

- Next.js 16 release notes: https://nextjs.org/blog
- Walrus docs: https://docs.wal.app
- Walrus TypeScript SDK: https://sdk.mystenlabs.com/walrus
- Tatum Sui RPC: https://docs.tatum.io/reference/rpc-laser-stream
- Sui Testnet Faucet: https://faucet.sui.io/
- Walrus Testnet Faucet: https://faucet.wal.app/
- dapp-kit: https://sdk.mystenlabs.com/dapp-kit
- Sui TypeScript SDK: https://sdk.mystenlabs.com/typescript
- Walruscan explorer: https://walruscan.com
- Hackathon page: https://tatum.io/tatum-x-walrus-hackathon
