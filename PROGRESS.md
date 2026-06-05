# throwit — Project Progress

**Last updated:** 2026-06-05 (Auth Mode Bug — fixed; see 🐛 below)  
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
| **NetworkBanner** (`components/NetworkBanner.tsx`) | ✅ Complete | Bottom-bar auth-mode indicator. Fixed: now correctly nested inside `<AuthProvider>` so it reflects live `authMode` state from `LoginButton` (see 🐛 bug report below). |

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

### 🐛 **BUG REPORT: Auth Mode Stuck on RPC After API Key Login**

**Date:** 2026-06-05  
**Severity:** High (P0 — Core feature broken)  
**Status:** ✅ **FIXED**  
**Affected Files:**
- `app/layout.tsx`
- `app/providers.tsx`
- `context/AuthContext.tsx`
- `components/LoginButton.tsx`

#### Symptom
User enters a Tatum API key in `LoginButton`, clicks **Login**, the dialog closes — but the bottom bar (`NetworkBanner`) continues to display:

```
🟢 AUTH MODE: TATUM RPC (on-chain)
```

instead of the expected pulsing-yellow:

```
🟡 AUTH MODE: TATUM GASLESS
```

The same stuck-RPC state occurred across page navigations and on full reload (after entering the API key for the first time).

#### Root Cause
**`NetworkBanner` was rendered OUTSIDE the React component tree that contained `AuthProvider`.**

In `app/layout.tsx`, the body had:

```tsx
<body>
  <Providers>{children}</Providers>   {/* AuthProvider lives here */}
  <NetworkBanner />                    {/* ← OUTSIDE! No context! */}
</body>
```

Because `NetworkBanner` was a sibling of `<Providers>` (not a descendant), it was **never wrapped by `AuthProvider`**. Every call to `useAuth()` from `NetworkBanner` returned the **fallback context value** defined in `AuthContext.tsx`:

```ts
return {
  authMode: 'rpc',           // ← hardcoded fallback
  setAuthMode: () => {},      // ← no-op
  apiKeyConfigured: false,
  ...
} as AuthContextType;
```

So no matter what `setAuthMode('gasless')` did inside `LoginButton`, `NetworkBanner` was reading from an entirely different (defaulted) context instance. The state update was succeeding — `NetworkBanner` simply had no way to observe it.

#### Why Previous Fix Attempts Failed
We iterated through several red herrings before finding the real issue:

1. **Attempt 1: Removed `useEffect` auto-switch in `LoginButton`** — suspected of causing a circular state update. Removing it changed nothing.
2. **Attempt 2: Made `apiKeyConfigured` a real `useState`** — replaced the inline `localStorage.getItem()` read with proper React state. Still didn't fix the bottom bar.
3. **Attempt 3: Added `setApiKeyConfigured` to context** — added a direct setter for the API key state and called it from `handleApikeyLogin`. `LoginButton` updated correctly, but the bottom bar remained stuck.
4. **Attempt 4: Refactored `AuthContext` with `hydrated` flag** — separated the React state setter (`setAuthModeState`) from the public API (`setAuthMode`) and added a hydration effect. Still didn't help.

All of these were valid improvements to `AuthContext`, but none of them addressed the actual problem: **`NetworkBanner` was in a different React tree entirely.**

#### The Fix
Two surgical changes:

**1. `app/layout.tsx`** — removed `<NetworkBanner />` from the body (it was outside the providers):

```diff
- <Providers>{children}</Providers>
- <NetworkBanner />
+ <Providers>{children}</Providers>
```

**2. `app/providers.tsx`** — moved `<NetworkBanner />` INSIDE `<AuthProvider>`, after `<main>`:

```diff
  <AuthProvider>
    <header>...<LoginButton /></header>
    <main>{children}</main>
+   <NetworkBanner />
  </AuthProvider>
```

That's it. Two lines of changes. The bottom bar now shares the same `AuthContext` as `LoginButton`, and the auth-mode state propagates correctly.

#### Verification
- ✅ Build passes (`npm run build`).
- ✅ `NetworkBanner` is now a descendant of `<AuthProvider>` in the React tree.
- ✅ When user enters an API key in `LoginButton`, the bottom bar flips from `TATUM RPC (on-chain)` (green dot) to `TATUM GASLESS` (pulsing yellow dot) instantly.
- ✅ State persists across page navigation because the provider sits at the layout root.

#### Lessons Learned
1. **Provider boundaries matter.** Any component that consumes a React context must be rendered as a descendant of that context's provider. Sibling placement silently falls back to the default value with no warning.
2. **Hardcoded fallback values can mask bugs.** The `useAuth()` fallback in `AuthContext.tsx` (returning `authMode: 'rpc'`) made `NetworkBanner` *look* like it was working — it just never updated. A safer default would throw, or log a warning, when the fallback is used in production.
3. **Always check the React component tree first** when a context consumer behaves as if state never changes. Inspect the rendered DOM hierarchy before debugging state logic.
4. **When the same bug survives multiple refactors**, the fix is likely not in the state logic — it's in the structure of the component tree.

### 🐛 **BUG REPORT: Dual Mode Workflow Issues**

**Date:** 2026-06-05  
**Severity:** Critical (P0 — Core workflow broken)  
**Status:** ✅ **FIXED**  
**Affected Files:**
- `app/dashboard/page.tsx`
- `hooks/useFileUpload.ts`
- `lib/storage.ts`
- `components/MyUploads.tsx`

#### Symptoms
1. Users logged in with a Tatum API Key (gasless mode) but without a connected wallet were locked out of the dashboard by an "Access Required" wallet-connect check.
2. The upload hook (`useFileUpload.ts`) and storage utilities (`storage.ts`) determined the upload mode using a hardcoded `config.network === 'mainnet'` check. Consequently, Tatum storage was ignored on testnet (preventing developer testing) and direct Walrus client uploads were ignored on mainnet.
3. If a wallet was disconnected in gasless mode, file uploads crashed when saving metadata, because the history tracking was hardcoded to use `account.address`.
4. Deleting files from the history drawer failed for Tatum-uploaded files because the drawer required wallet transaction approval for all deletions and did not support Tatum's API deletion.

#### The Fixes
1. **Dashboard Access (`app/dashboard/page.tsx`)**: Replaced the check `if (!account)` with `if (!isAuthorized)` where authorization is granted if a wallet is connected OR if the user is in gasless mode with an API key configured. Added a "Login / API Key" button to prompt the unified login modal directly from the block page.
2. **Context-Aware Upload Mode (`hooks/useFileUpload.ts` & `lib/storage.ts`)**: Integrated the `useAuth()` hook in `useFileUpload.ts` and set `isTatumMode = authMode === 'gasless'`. Made `uploadToStorage()` in `lib/storage.ts` always call Tatum's upload helper rather than throwing based on network.
3. **Fallback History Key (`hooks/useFileUpload.ts` & `components/MyUploads.tsx`)**: History is now saved and loaded using `account?.address || 'gasless'` as a key so gasless mode works flawlessly without wallet connectivity.
4. **Gasless Deletions (`components/MyUploads.tsx`)**: Updated `handleDelete` to check if the file was uploaded via Tatum (by storage provider or empty object ID). For Tatum files, it calls `instantDeleteUpload` using the saved Tatum API key—bypassing wallet signature prompt completely.

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
