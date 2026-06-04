---
name: ThrowIt Design System
description: Cyber-secure technical dark system for decentralized file sharing
colors:
  primary: "#10b981"
  neutral-bg: "#020617"
  neutral-card: "#0f172a"
  accent: "#1e293b"
  border: "#334155"
typography:
  display:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#34d399"
  card-container:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: ThrowIt

## 1. Overview

**Creative North Star: "The Cryptographic Vault"**

The ThrowIt design system represents a cyber-secure, technical environment built around extreme data privacy, speed, and Web3 cryptographic interactions. The visual interface simulates the control panels of a secure vault—utilizing deep slate-950 and slate-900 metallic backdrops, glowing emerald accent lines, and technical layout grids to convey trust, safety, and modern encryption. 

The system rejects soft beige/cream SaaS layouts, rounded playfulness, or visual noise. Interaction is structured, minimal, and secure.

**Key Characteristics:**
- **Technically Precise**: Mono-labels, structured step flowcharts, and clear byte-size data readouts.
- **Atmospheric Depth**: Dark mode with subtle neon-teal and violet ambient gradients to ground glowing modules.
- **Zero-Knowledge Aesthetics**: Interfaces emphasize client-side cryptography, exposing keys only when locally active in browser tabs.

## 2. Colors

The color palette consists of cool, high-contrast dark slate neutrals accented by a singular glowing emerald brand color.

### Primary
- **Glowing Emerald** (#10b981 / oklch(0.627 0.183 149.572)): Used for main call-to-actions, successful cryptographic states, progress markers, and primary badges.

### Neutral
- **Deep Slate** (#020617 / oklch(0.12 0 0)): The root background of the entire application.
- **Metal Panel** (#0f172a / oklch(0.16 0 0)): Used for dialog backdrops, upload cards, and component containers.
- **Sleek Accent** (#1e293b / oklch(0.22 0 0)): Hover backdrops, select boxes, and active focus rings.
- **Slick Border** (#334155 / oklch(0.24 0 0)): Structural lines, item dividers, and outer component boundaries.

### Named Rules
**The Emerald Constraint Rule.** Glowing emerald accents are restricted to ≤10% of any viewport. Its rarity is what signals action and verified success.

**The Cold Contrast Rule.** Grays and mid-tones are prohibited. Text is either crisp white (#f1f5f9) or muted slate (#64748b) to ensure readability.

## 3. Typography

**Display Font:** Geist Sans (with system-ui, sans-serif fallback)
**Body Font:** Geist Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with monospace fallback)

The typography pairings leverage tight letter-spacings and high weight contrast to resemble terminal interfaces and modern developer tools.

### Hierarchy
- **Display** (800, clamp(2.5rem, 5vw, 4.5rem), 1.1): Used for main marketing hero headlines.
- **Headline** (700, 2rem, 1.2): Used for sections and dashboard titles.
- **Title** (600, 1.25rem, 1.3): Used for cards, dialog title headers, and file upload names.
- **Body** (400, 0.875rem, 1.6): General description copy and longform content. Max line-length is kept at 65ch.
- **Label** (500, 0.75rem, 0.05em, uppercase): Monospace data labels, badge titles, and bytes counts.

### Named Rules
**The Single-Family Rule.** Do not introduce competing sans-serif or serif fonts. Geist Sans handles all visual weights, while Geist Mono handles tabular metrics.

## 4. Elevation

The elevation system is flat by default, communicating structural stability and self-custodied storage. Layers are defined via dark border strokes and nested color values, rather than floating drop-shadows.

### Shadow Vocabulary
- **Ambient Glow** (`box-shadow: 0 0 20px rgba(16,185,129,0.15)`): Used on primary button hover states and card status glows to simulate active tech fields.

### Named Rules
**The Outline-Depth Rule.** Interfaces communicate depth using solid 1px borders (#334155). Shadows are reserved strictly as an interactive response to focus or successful completion.

## 5. Components

### Buttons
- **Shape:** Medium curved edges (12px / rounded-xl)
- **Primary:** Glowing Emerald background with Deep Slate text (`px-6 py-3 text-sm font-semibold`)
- **Hover / Focus:** Scale down on click (`active:scale-98`), bright glow shadow on hover (`shadow-[0_0_20px_rgba(16,185,129,0.2)]`)
- **Secondary / Icon:** Dark border stroke with subtle hover fill (`hover:bg-slate-800 text-slate-300`)

### Cards / Containers
- **Corner Style:** Large curved corners (16px / rounded-2xl)
- **Background:** Metal Panel background with Slick Border stroke
- **Shadow Strategy:** Flat at rest, with a subtle gradient aura behind the container for interactive depth
- **Internal Padding:** Spaced padding (`p-6`)

### Inputs / Fields
- **Style:** Dark background (#020617) with border (#334155), rounded corners (8px / rounded-lg)
- **Focus:** Emerald focus ring with no outline (`focus:ring-2 focus:ring-emerald-500`)

### Navigation
- **Style:** Sticky top navigation bar with a glassmorphism backdrop blur (`backdrop-blur-md bg-slate-950/60`), height restricted to 68px.

## 6. Do's and Don'ts

### Do:
- **Do** keep display headline letter-spacings tight (-0.03em) to reinforce the industrial aesthetic.
- **Do** align file metrics, addresses, and hash IDs to uppercase Geist Mono fonts.
- **Do** apply active click scales (`scale-98`) on all interactive buttons for tactile user feedback.

### Don't:
- **Don't** use soft beige/cream-colored SaaS layouts, warm grays, or brass-tinted borders.
- **Don't** add side-stripe borders (e.g., border-left-4 emerald on callouts).
- **Don't** use text gradients, decorative glassmorphism, or float shadows above 8px blur at rest.
