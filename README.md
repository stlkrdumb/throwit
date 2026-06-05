# 🎒 ThrowIt — Zero-Knowledge Gasless File Transfer

> Upload files. E2E encrypted. Share via link. No wallets required, zero gas fees.

Powered by [Walrus](https://walrus.site) on Sui, utilizing gasless relayer infrastructure from [Tatum](https://tatum.io) and styled with a vibrant, high-contrast **Neobrutalist** design system.

---

## 🚀 Key Features

*   **Tatum Gasless Mode (Main Feature):** Upload and transfer files instantly without needing a crypto wallet, signature popups, or gas fees. Tatum automatically handles and sponsors all on-chain storage transactions gaslessly in the background.
*   **100% Zero-Knowledge Privacy:** Client-side encryption using military-grade `AES-256-GCM`. The decryption keys, initialization vectors, and file names reside strictly in the URL hash fragment (`#key.iv.filename`), which is never sent to any server.
*   **In-Browser ZIP Compression:** Drag-and-drop multiple files or entire folder directories. The app bundles them into a single secure `.zip` package client-side before encrypting and uploading.
*   **Sui On-Chain Mode:** Web3 power users can switch to on-chain mode, connect their Sui wallet, directly sponsor storage epochs, and claim a full WAL deposit refund when they delete files.
*   **Active Shares Dashboard:** A drawer interface that tracks active uploads, formats file metadata, generates QR codes for easy mobile scanning, and performs on-chain self-destruct transactions.

---

## 🛠️ Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Framework** | Next.js 16 (App Router) | React 19, fast static optimization, Turbopack builds |
| **Aesthetics** | Vanilla CSS + Tailwind v4 | Premium **Neobrutalist** UI featuring hard black borders, flat shadows, and dynamic responsive states |
| **Web3 Relayer** | Tatum Storage API | Powers the core gasless upload relayers |
| **RPC & Gateway** | Tatum RPC Proxy | Redundant JSON-RPC & gRPC routing with automated fallbacks to official Sui nodes |
| **Storage & Chain** | `@mysten/walrus` & `@mysten/sui` | Decentralized blob storage and on-chain registrations |
| **Cryptography** | Web Crypto API + JSZip | Native client-side AES-GCM 256-bit encryption & browser compression |

---

## 📐 Architecture

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

---

## ⚡ Setup & Installation

Ensure you have Node.js 20+ installed.

```bash
# Clone & install
git clone <repo-url> && cd throwit
cp .env.local.example .env.local
npm install

# Run dev server (with Turbopack)
npm run dev
```

### Environment Settings (`.env.local`)
Configure the following keys for local development on Mainnet:
*   `NEXT_PUBLIC_SUI_NETWORK=mainnet`
*   `NEXT_PUBLIC_TATUM_RPC=https://sui-mainnet.gateway.tatum.io`
*   `NEXT_PUBLIC_TATUM_API_KEY_MAINNET=your_tatum_api_key`
*   `NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus.site`

---

## 💡 How It Works

### Upload Flow
1. The user drops files or folders onto the dropzone.
2. Multiple files are bundled into a `.zip` archive directly in the browser.
3. The Web Crypto API generates a cryptographically secure key and initialization vector (IV) to encrypt the archive using AES-256-GCM.
4. **Tatum Gasless Mode:** The encrypted payload is sent to Tatum's Storage API. Tatum automatically books the Walrus storage slot on the Sui mainnet gaslessly, uploads the slivers, and returns the certified `blobId`.
5. **Sui On-Chain Mode:** Alternatively, the user connects their wallet, pays the temporary epoch storage deposit, uploads slivers to storage nodes directly, and registers the certificate.
6. A share link is generated: `{appUrl}/d/{blobId}#{keyB64}.{ivB64}.{filename}`. The `#` hash parameters stay on the client and are never sent over the network.

### Download Flow
1. The recipient opens the share link.
2. The page parses the decryption key, IV, and filename from the URL hash.
3. The page fetches the encrypted file from Walrus (directly via HTTPS nodes or via the Tatum proxy).
4. The file is decrypted locally in the recipient's browser.
5. The browser triggers a save file dialog to download the decrypted plaintext data.

---

## 🏆 Hackathon Submission

This project is submitted to the **Sui x Walrus Hackathon**, targetting:
*   **Walrus Track:** Core decentralized storage integration.
*   **Tatum Track:** Integration of Tatum Storage API and Tatum RPC routing for Gasless Mode execution.
*   **Mainnet Bonus:** Fully configured and optimized to run directly on Sui Mainnet.

---

## 📄 License

MIT © [ThrowIt Team](https://github.com/throwit-transfer)
