# 🎒 ThrowIt — Decentralized File Transfer

> Upload files. E2E encrypted. Share via link. No accounts, no subscriptions.

Powered by [Walrus](https://walrus.site) on Sui, with RPC infrastructure from [Tatum](https://tatum.io).

---

## Demo

1. **Select** a file (drag & drop or click)
2. **Pick expiry** — 1h, 3h, 1d, or 3d
3. **Upload** — file encrypts locally via Web Crypto API, then stores on Walrus
4. **Share** — copy the generated link (key lives in URL fragment only)
5. **Download** — recipient opens link → auto-decrypts in browser → triggers download

## Architecture

```
User Browser                          Server (Vercel)                    Walrus Network
┌──────────────┐                      ┌─────────────┐                    ┌─────────────────┐
│              │   1. Upload file     │             │     2. writeBlob    │                 │
│  AES-256-GCM │ ──────────────────►  │  Next.js 16 │ ─────────────────►  │  Sui + Storage  │
│  Encryption  │                      │  App Router │  (encrypted blob)  │  Nodes          │
│              │   3. Share link      │             │                    │                 │
│  Key in URL  │ ◄──────────────────  │  (no state) │                    └─────────────────┘
│  fragment!   │                      │             │
└──────────────┘                      └─────────────┘
```

**Key security properties:**
- **Client-side encryption only** — Web Crypto API AES-GCM. No server ever sees plaintext.
- **Keys in URL fragment** — `#` is never sent to any server (browser-only). The key, IV, and filename live exclusively in the recipient's browser.
- **No database** — blob metadata stored on-chain via Walrus. Share links are self-contained.

## Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js 16 (App Router) | Turbopack default, React 19, fast builds |
| Styling | Tailwind CSS v4 + shadcn/ui | Premium UI, zero custom CSS |
| Wallet | `@mysten/dapp-kit-react` | Standard multi-wallet selector modal with custom UI |
| Blockchain | @mysten/sui (SDK v2) | gRPC client, PTB construction |
| Storage | @mysten/walrus | Decentralized blob storage on Sui |
| RPC | Tatum gateway | Qualifies for Tatum Tools prize |
| Encryption | Web Crypto API | Native AES-GCM 256-bit, zero deps |

## Cost Comparison

| Service | 1 GB / 30 days | E2E Encrypted | Decentralized |
|---------|---------------|---------------|---------------|
| WeTransfer Pro | $13/mo + trust | ❌ | ❌ |
| Arweave | ~$10 one-time | ❌ | ✅ |
| **ThrowIt (this app)** | **~$0.01** | **✅** | **✅** |

## Setup

```bash
# Node.js 20+ required (Next.js 16)
node -v

# Clone & install
git clone <repo> && cd throwit
cp .env.local.example .env.local
npm install

# Fund testnet wallet with SUI + WAL from faucets:
# https://faucet.sui.io/
# https://faucet.wal.app/

# Dev server (Turbopack, ~10x faster HMR)
npm run dev
```

## Environment Strategy

| Environment | Network | RPC | Use Case |
|-------------|---------|-----|----------|
| Development (`npm run dev`) | Sui Testnet | Tatum testnet gateway | Free iteration, faucets |
| Production (Vercel) | Sui Mainnet | Tatum mainnet gateway | Live deployment, prizes |

`.env.local.example` has public values — copy to `.env.local` for local dev.  
`.env.production` is committed (mainnet URLs only).

## Project Structure

```
throwit/
├── app/
│   ├── layout.tsx            # Root layout + Providers wrapper
│   ├── providers.tsx         # Client-side: QueryClient + DAppKitProvider + WalletButton
│   ├── page.tsx              # Landing page (hero + upload card)
│   └── d/[blobId]/page.tsx  # Download page (fetch → decrypt → download)
├── components/
│   ├── UploadCard.tsx        # Drag-drop, encrypt, upload flow UI
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── config.ts             # Network-aware config (single source of truth)
│   ├── crypto.ts             # AES-GCM encrypt/decrypt helpers
│   ├── walrus.ts             # WalrusClient upload/download helpers
│   └── link.ts               # Share link encode/decode
├── .env.local.example        # Template for teammates
├── .env.production           # Committed (public mainnet values)
└── tailwind.config.ts        # Tailwind v4 + shadcn integration
```

## How It Works

### Upload Flow
1. User selects file via drag-drop
2. Browser generates AES-256-GCM key (Web Crypto API)
3. File encrypted client-side: `encrypt(plaintext, key)` → `ciphertext + iv`
4. Encrypted blob uploaded to Walrus: `walrusClient.writeBlob({ blob, epochs, signer })`
5. Share link constructed: `{appUrl}/d/{blobId}#{base64url(key)}.{base64url(iv)}.{filename}`
   - URL fragment (`#`) is never sent to any server → key stays client-only

### Download Flow
1. Recipient opens share link
2. Page reads `key`, `iv`, and `filename` from `window.location.hash`
3. `walrusClient.readBlob({ blobId })` → returns ciphertext
4. `decrypt(ciphertext, key, iv)` → plaintext
5. Browser triggers download via `URL.createObjectURL(blob) + <a download>` click

## Hackathon Submission

### Target Categories
- **Walrus Prize** — core of the product (blob storage is the primary feature)
- **Best Use of Tatum Tools** ($200) — Tatum RPC gateway for blockchain access
- **Mainnet Bonus** — production deployment uses Sui mainnet
- **X / LinkedIn Sharing Bonus** — tag @Tatum_io @WalrusFoundation @SuiNetwork

### Notes
- Testnet deployment: blobs stored on testnet, links work on testnet only
- Mainnet deployment: blobs stored on mainnet, links work on mainnet only
- Networks are never mixed — deployment URL implicitly defines network

## Future Roadmap
- [ ] SUI paywall to unlock downloads
- [ ] QR code generator for share links
- [ ] Multi-recipient uploads with per-recipient keys
- [ ] Seal threshold encryption (multi-party decryption)
- [ ] Mobile app via React Native + wallet-standard-first

## Credits

- Walrus docs: https://docs.wal.app
- Tatum docs: https://docs.tatum.io
- Sui SDK v2: https://sdk.mystenlabs.com/sui
- dApp Kit: https://sdk.mystenlabs.com/dapp-kit
