# throwit — Neobrutalist Design System (Dark)

## Philosophy

**throwit is loud.** This isn't a corporate dashboard. It's a tool for people who want to share files with confidence, attitude, and zero pretense. The neobrutalist aesthetic reflects that: hard edges, bold colors, physical interactions, and unapologetic contrast.

---

## Color Palette

### Base Colors
| Token | Hex | OKLCH Equivalent | Usage |
|-------|-----|------------------|-------|
| `--neo-black` | `#000000` | `oklch(0 0 0)` | Borders, pure dark accents |
| `--neo-page-bg` | `#0A0A0A` | `oklch(0.04 0 0)` | Page background |
| `--neo-surface` | `#111111` | `oklch(0.07 0 0)` | Card surfaces, panels |
| `--neo-surface-hover` | `#161616` | `oklch(0.09 0 0)` | Hover states on cards |
| `--neo-text-primary` | `#F0F0F0` | `oklch(0.94 0 0)` | Primary text, headlines |
| `--neo-text-muted` | `#888888` | `oklch(0.53 0 0)` | Secondary text, labels |

### Accent Colors (Neon)
| Token | Hex | OKLCH Equivalent | Usage |
|-------|-----|------------------|-------|
| `--neo-pink` | `#FF4081` | `oklch(0.67 0.25 350)` | Primary CTAs, active upload |
| `--neo-cyan` | `#69FFFF` | `oklch(0.92 0.12 190)` | Links, secondary actions |
| `--neo-lime` | `#B2FF59` | `oklch(0.87 0.21 130)` | Success states, completion |
| `--neo-amber` | `#FFAB40` | `oklch(0.78 0.18 70)` | Warnings, ZIP packs, pending |
| `--neo-purple` | `EA80FC` | `oklch(0.72 0.23 310)` | Wallet indicators, premium |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--neo-red` | `#FF5252` | Errors, destructive actions, delete |
| `--neo-green` | `#4CAF50` | Success confirmations (use --neo-lime when possible) |

---

## Typography

### Type Scale
| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| **H1 Display** | Space Grotesk | clamp(3rem, 6vw, 5.5rem) | 900 (Black) | Hero sections, landing page headlines |
| **H2 Section** | Space Grotesk | clamp(1.75rem, 3vw, 2.5rem) | 800 (ExtraBold) | Page section headers, dashboard titles |
| **H3 Card Title** | Space Grotesk | 1.25rem | 700 (Bold) | Card headers, upload card titles |
| **Body Regular** | Inter | 1rem | 400 (Regular) | Body copy, descriptions |
| **Body Bold** | Inter | 1rem | 600 (SemiBold) | Emphasized text, labels |
| **Caption/Mono** | JetBrains Mono | 0.75rem–0.875rem | 400 (Regular) | Blob IDs, hex codes, file sizes, timestamps |

### Font Import Strategy
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Typography Rules
- **Headlines are oversized** — if in doubt, make them bigger
- **Body text must remain readable** — good line-height (1.5–1.7), adequate contrast
- **Blob IDs and technical strings use monospace** — they're data, not prose
- **Uppercase sparingly** — only for labels, nav items, short buttons

---

## Shadow System (Hard, Zero Blur)

### The Signature Move
```css
/* THE neobrutalist shadow formula: offset X offset Y 0 (no blur) #color */
.box-shadow-sm { box-shadow: 2px 2px 0 #000; }
.box-shadow-md { box-shadow: 4px 4px 0 #000; }   /* Default for cards */
.box-shadow-lg { box-shadow: 6px 6px 0 #000; }   /* Modals, key CTAs */
.box-shadow-xl { box-shadow: 8px 8px 0 #000; }   /* Dropdowns, popups */

/* Colored shadows (use accent colors sparingly) */
.box-shadow-pink { box-shadow: 4px 4px 0 var(--neo-pink); }
.box-shadow-cyan { box-shadow: 4px 4px 0 var(--neo-cyan); }
```

### Interactive States
```css
/* Hover: shadow grows outward (lift) */
.hover-lift:hover {
  box-shadow: 6px 6px 0 #000;
  transform: translate(-2px, -2px);
}

/* Active/Pressed: shadow shrinks (press down) */
.active-press:active {
  box-shadow: 2px 2px 0 #000;
  transform: translate(2px, 2px);
}
```

---

## Border System

### Standard Borders
| Token | Usage | Style |
|-------|-------|-------|
| `--neo-border-thick` | Cards, panels, containers | `3px solid #000` |
| `--neo-border-bold` | Inputs, dropdowns | `2px solid #000` |
| `--neo-border-line` | Dividers, section separators | `1px solid #2A2A2A` (subtle) |

### Colored Borders (for emphasis/status)
- Left border strip on file list items matching file-type color
- Green/red borders on success/error states in cards
- Cyan dashed border on dropzone active state

---

## Border Radius

**Default: sharp.** Neobrutalism prefers crisp edges.

| Token | Value | Usage |
|-------|-------|-------|
| `--neo-radius-sm` | `2px` | Small badges, tags, inline elements |
| `--neo-radius-md` | `4px` | Buttons, inputs, cards (preferred) |
| `--neo-radius-lg` | `8px` | Modals, dropdowns (rare) |
| **Default** | `0` or `4px` | Most UI elements |

**Anti-pattern:** `16px+` radius, pill shapes on major containers.

---

## Spacing Scale

Use Tailwind spacing with a slight bias toward **more** space. Neobrutalism breathes.

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)          ← default card padding interior
lg: 1.5rem (24px)        ← section spacing
xl: 2rem (32px)
2xl: 3rem (48px)         ← between major sections
```

**Rule of thumb:** Card interior padding = `p-5` or `p-6`. Gap between cards = `gap-4` or `gap-6`.

---

## Component Patterns

### Buttons
| Type | Background | Text Color | Border | Shadow |
|------|-----------|------------|--------|--------|
| Primary (CTA) | `--neo-pink` | `#000` | 3px solid `#000` | 4px 4px 0 `#000` |
| Secondary | Transparent | `--neo-text-primary` | 2px solid `--neo-text-muted` | none |
| Danger (Delete) | `--neo-red` | `#FFF` | 3px solid `#000` | 4px 4px 0 `#000` |
| Ghost/Hover fill | Hover: `#000` | White on hover | 2px solid `#000` | none (becomes filled) |

**Hover behavior:** Shadow grows by 2px, translate up by 2px. **Active state:** Shadow shrinks to 2px, translate down by 2px.

### Cards / Panels
| Property | Value |
|----------|-------|
| Background | `--neo-surface` (`#111111`) |
| Border | `3px solid #000` |
| Shadow | `4px 4px 0 #000` (default), `6px 6px 0 #000` (featured) |
| Padding | `p-5` or `p-6` |
| Radius | `4px` max |

### Inputs / Text Fields
| Property | Value |
|----------|-------|
| Background | White (`#FFFFFF`) — high contrast against dark page |
| Border | `3px solid #000` (thick by default) |
| Focus state | Shadow appears: `4px 4px 0 #000` |
| Placeholder | Gray (`#666666`) |
| Radius | `4px` |

### File Type Icons in Upload List
Each uploaded file gets a colored left-border strip and icon matching its type:

| Type | Color | Icon Example |
|------|-------|-------------|
| ZIP/Pack | Amber (`--neo-amber`) | 📦 Archive |
| Image | Pink (`--neo-pink`) | 🖼️ Image |
| Video | Cyan (`--neo-cyan`) | ▶️ Video |
| Document | Purple (`--neo-purple`) | 📄 Doc |
| Code/Text | Lime (`--neo-lime`) | </> Code |

### Nav Bar / Header
- Background: `#000` (pure black) or `var(--neo-surface)`
- Bottom border: `3px solid var(--neo-pink)` or accent color
- Active link indicator: bottom underline in `--neo-cyan` (2px solid, thick)

### Upload Card States
| State | Visual Treatment |
|-------|-----------------|
| Idle/Ready | Standard card, dropzone with dashed `--neo-cyan` border |
| Uploading | Progress bar fills left side of card in `--neo-pink`, label says "Uploading…" |
| Complete | Card glows green — thick lime left border, success icon |
| Error | Red border on error section, error message in red text |

---

## Anti-Patterns (For This Project)

### ❌ What NOT to Do
- Soft shadows with blur (`0 4px 6px rgba(0,0,0,0.1)`) → use hard offsets
- Gradients of any kind → flat colors only
- Transparency/opacity → opaque everything
- Thin (1px) borders on containers → thick (3px) borders
- High border-radius (`12px+`) on major elements → sharp or minimal (`4px max`)
- Low contrast text on dark backgrounds → `#F0F0F0` minimum on `#0A0A0A`
- Pill-shaped buttons/inputs on main CTAs → rectangular, sharp edges
- Subtle corporate design (no neon accents allowed)

### ✅ What TO Do
- **Every card is a panel** with thick borders and hard shadows
- **Buttons are physical** — hover lifts, active presses
- **Colors are deliberate** — each accent has a semantic role
- **Typography screams hierarchy** — headlines dominate, body stays clean
- **Blob IDs stand out** — monospace font, colored background badge
- **Icons have personality** — file type icons in matching color squares

---

## Accessibility Notes

Despite the bold aesthetic:
1. **All text meets WCAG AA contrast** on dark backgrounds (tested with `#F0F0F0` on `#0A0A0A`)
2. **Focus states are visible** — colored ring + shadow change on interactive elements
3. **No motion dependency** — hover effects use transforms that can be disabled via `prefers-reduced-motion`
4. **Color is never the only indicator** — status conveyed by icon + text + color (e.g., "Upload failed" with 🚫 red icon)

---

## Quick Decision Checklist

Before styling anything, ask:

1. **Does it have thick borders?** → If no, add `3px solid #000`
2. **Does it have hard shadows?** → If no, add `box-shadow: 4px 4px 0 #000`
3. **Is it flat/solid color?** → No gradients, no transparency
4. **Are corners sharp or minimal?** → `4px max`, prefer `0`
5. **Is contrast high?** → Light text on dark bg, bold colors against neutrals
6. **Does it feel physical?** → Hover/active states should translate + shadow change

If you can check all 6: it's neobrutalist for throwit.
