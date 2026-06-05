# throwit — Project Progress

**Last updated:** 2026-06-05  
**Branch:** `alpha`  
**Next.js:** 16.2.7 (Turbopack) | **Sui:** Testnet | **Storage:** Walrus

---

## 🟢 Completed

### Core App Pages
| Page | Status | Notes |
|------|--------|-------|
| **Landing / Home** (`app/page.tsx`) | ✅ Complete | Hero section, feature grid, "How it works" 4-step flow. Neobrutalist cream/dark theme applied. |
| **Dashboard** (`app/dashboard/page.tsx`) | ✅ Complete | Upload card + MyUploads list. File type icons, ZIP pack support. |
| **Download Page** (`app/d/[blobId]/page.tsx`) | ✅ Complete | Blob ID display, decryption flow, progress tracking. Dark theme applied. |

### Upload System
| Component | Status | Notes |
|-----------|--------|-------|
| **UploadCard** (`components/UploadCard/`) | ✅ Complete | 4 states: Idle / Loading / Complete / Error. File picker, drag-drop zone. |
| **File type system** | ✅ Complete | `getFileType()` + `FileTypeConfig` interface. Color-coded strips per type. |
| **Encryption flow** | ✅ Complete | Web Crypto API AES-256-GCM. Key stored in URL hash fragment. |
| **Walrus upload** | ✅ Complete | `uploadToWalrus()` using @mysten/walrus SDK. Blob splitting + multi-shard write. |

### Upload UX Features
| Feature | Status | Notes |
|---------|--------|-------|
| **Single file upload** | ✅ Complete | Drag-drop or click picker, shows preview + details. |
| **Multi-file / ZIP pack** | ✅ Complete | Multi-select uploads bundled into single ZIP with metadata. |
| **Progress tracking** | ✅ Complete | Per-file progress bars, overall pack progress indicator. |
| **Share link generation** | ✅ Complete | Generates encrypted download link with hash-fragment key. |
| **Recovery panel** | ✅ Complete | Shows recovery instructions on failed uploads. |

### UI Components (Neobrutalist Theme)
| Component | Status | Notes |
|-----------|--------|-------|
| **shadcn/ui/button.tsx** | ✅ Complete | Neo-button system with shadow grow/press behaviors. |
| **shadcn/ui/card.tsx** | ✅ Complete | 3px black border + hard shadow header/footer system. |
| **shadcn/ui/dialog.tsx** | ✅ Complete | White neo-card overlay, solid backdrop. |
| **shadcn/ui/input.tsx** | ✅ Complete | Black border, uppercase mono input fields. |
| **shadcn/ui/tabs.tsx** | ✅ Complete | Black active tab (inverse), bold uppercase labels. |
| **shadcn/ui/progress.tsx** | ✅ Complete | Pink fill in black-bordered track, rounded-sm. |
| **WalletButton** (`components/WalletButton/`) | ✅ Complete | Dropdown trigger + connect wallet dialog. Neo-brutalist styling. |
| **MyUploads** (`components/MyUploads/`) | ✅ Complete | File list strips with type colors, ZIP pack preview, delete action. |
| **LandingCTA** (`components/LandingCTA.tsx`) | ✅ Complete | CTA button + wallet connect dialog for landing page. |
| **NetworkBanner** (`components/NetworkBanner.tsx`) | ✅ Complete | Yellow dev-mode indicator pill (bottom-right). |

### Design System
| Token | Status | Notes |
|-------|--------|-------|
| **Color palette** | ✅ Defined | `--neo-pink`, `--neo-cyan`, `--neo-lime`, `--neo-amber`, `--neo-purple`, `--neo-red` |
| **Surface tones** | ✅ Added | `--neo-cream` (#F5F0E6), `--neo-surface` (#EDE8DC), `--neo-surface-hover` (#E0DBCF) |
| **Shadows** | ✅ Defined | Hard offset system: 2/4/6/8px × 2 offsets, zero blur. |
| **Typography** | ✅ Applied | Space Grotesk (display), Inter (body), JetBrains Mono (data). Fonts via `<head>` link tag. |
| **Borders** | ✅ Standardized | `3px solid #000` on containers, `2px` on buttons/inputs, sharp 2px max corners. |

### Infrastructure
| Item | Status | Notes |
|------|--------|-------|
| **TypeScript** | ✅ Clean | `tsc --noEmit` passes with zero errors. |
| **Git commits** | ✅ Tracked | All changes committed on `alpha` branch. |

---

## 🟡 In Progress / Known Issues

### Build Fixes Applied
- **Font import moved:** From CSS `@import` → Next.js `<head>` `<link>` tag (fixes Turbopack `@import` ordering error).
- **Ring color fix:** Replaced `@apply ring-cyan` with plain CSS `outline-color: var(--neo-cyan)` (Tailwind can't resolve custom vars in `@apply`).

---

## 🔴 Not Started / Backlog

### Wallet & Onchain Features
| Feature | Priority | Notes |
|---------|----------|-------|
| **Tatum RPC integration** | High | Required for hackathon submissions. Need API key + config. |
| **On-chain deposit tracking** | Medium | Display Sui staking deposits, allow recovery. |
| **Mainnet support** | Medium | Switch from testnet → mainnet configuration. |
| **Wallet detection UX** | Low | Better messaging for users without wallet extensions. |

### Upload & Storage
| Feature | Priority | Notes |
|---------|----------|-------|
| **Upload retry logic** | Medium | Auto-retry on network failures with exponential backoff. |
| **Chunked uploads (large files)** | High | Split files >5MB into chunks for better upload reliability. |
| **File preview thumbnails** | Medium | Image previews in upload card and MyUploads list. |
| **Expiry / auto-delete** | Low | Set file expiration on link generation. |

### UX Polish
| Feature | Priority | Notes |
|---------|----------|-------|
| **Accessibility audit** | High | Color contrast, keyboard navigation, focus states across all pages. |
| **Mobile responsive review** | Medium | Dashboard and upload card need mobile testing. |
| **Error message improvements** | Low | More user-friendly error messaging for Walrus/encryption failures. |
| **Animation polish** | Low | Micro-interactions on hover/press (already partially done via `neo-hover-lift`). |

### Code Quality
| Item | Priority | Notes |
|------|----------|-------|
| **Test coverage** | Medium | Jest/Vitest setup for upload and encryption utilities. |
| **Bundle size audit** | Low | Check if all deps are tree-shakeable, remove unused shadcn components. |

---

## 📐 Design System Quick Reference

### Anti-Pattern Checklist (Every Component)
1. [ ] Thick borders? (`3px solid #000`)
2. [ ] Hard shadows? (`box-shadow: 4px 4px 0 #000`)
3. [ ] Flat colors? (No gradients, no transparency)
4. [ ] Sharp corners? (`4px max` radius)
5. [ ] High contrast? (Light text on dark bg)
6. [ ] Physical feel? (Hover lifts, active presses)

---

## 🚀 Next Immediate Actions

1. **Run `next dev --turbo`** and verify all pages render correctly with new cream theme
2. **Test full upload flow**: single file → multi-file ZIP → share link → download decrypt
3. **Add Tatum RPC configuration** for hackathon eligibility
4. **Run accessibility audit** — check contrast ratios, keyboard navigation
5. **Mobile test** — verify upload card and dashboard on phone screens
