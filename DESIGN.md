---
name: ThrowIt Neobrutalist Design System
description: Modern neobrutalist visual framework with thick borders and hard shadows
colors:
  primary: "#AA00FF"
  neutral-bg: "#F5F0E6"
  neutral-card: "#FFFFFF"
  accent: "#C6FF00"
  border: "#000000"
typography:
  display:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  sm: "0px"
  md: "4px"
  lg: "4px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.border}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#FF6EB4"
  card-container:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: ThrowIt (Neobrutalist)

## 1. Overview

**Creative North Star: "The Analog Panel"**

The ThrowIt neobrutalist design system prioritizes absolute clarity, structure, and physical interaction. Taking cues from industrial machinery, analog electronics, and early internet styling, it features flat, opaque backdrops, bold `3px` solid black borders, and zero-blur offset shadows. 

It completely rejects gradients, soft lighting, glassmorphism, or rounded bubbles. Elements look and feel heavy, solid, and tactile.

**Key Characteristics:**
- **Thick Outlines**: Every card, input field, and button is bounded by a black stroke.
- **Physical Dynamics**: Elements respond to hover and active states by shifting in translation and shadow depth.
- **Flat Primary Accentuation**: Solid saturated primaries denote progress, danger, and wallet statuses.

## 2. Colors

No gradients. Saturated primaries on neutral backgrounds.

### Primary / Accent
- **Electric Purple** (#AA00FF): Primary branding color in light mode / secondary in dark mode.
- **Acid Lime** (#C6FF00): Primary branding color in dark mode / secondary in light mode.
- **Success Green** (#4CAF50): Complete statuses, explorer links, and active counts.

### Neutral
- **Neo Cream** (#F5F0E6): Page backdrop background.
- **Opaque White** (#FFFFFF): Input fields, lists, and card containers.
- **Heavy Black** (#000000): Borders, shadow blocks, and body text.

### Named Rules
**The Hard-Border Rule.** All containers, button cards, and popup panels MUST have a solid black border (`border: 3px solid #000000;`).
**The Zero-Blur Rule.** All shadows must be offset blocks with zero blur (`box-shadow: 4px 4px 0 #000000;`). No soft lighting or glows.

## 3. Typography

**Display Font:** Bebas Neue (with sans-serif fallback)
**Body Font:** Space Grotesk (with Arial fallback)
**Mono Font:** JetBrains Mono (with Courier New fallback)

Typography is bold, uppercase for headlines, and geometric for body copy, emphasizing layout weight and text contrast.

### Hierarchy
- **Display** (700, clamp(3.5rem, 8vw, 6rem), 0.95): Used for title headings and call-outs.
- **Headline** (700, 2.25rem, 1.1): Page headers and dashboard status blocks.
- **Title** (600, 1.25rem, 1.2): Component cards, uploads lists, and files names.
- **Body** (500, 1rem, 1.6): Description texts and instruction details.
- **Label** (700, 0.875rem, uppercase): Badges, numbers, and inputs labels.

## 4. Elevation

Depth is created using geometric translation shifts and offset shadows, simulating three-dimensional layers stacking vertically on the screen.

### Shadow Vocabulary
- **Standard Shadow** (`box-shadow: 4px 4px 0 #000000`): Used for buttons, cards, and input active states.
- **Deep Shadow** (`box-shadow: 8px 8px 0 #000000`): Used for high-impact cards (such as the main upload box).

### Named Rules
**The Shifting-State Rule.** When hovered, cards and buttons translate up-left (`transform: translate(-2px, -2px)`) while shadow depth increases. When clicked, elements compress down-right (`transform: translate(2px, 2px)`) with shadow depth shrinking.

## 5. Components

### Buttons
- **Shape:** Sharp or minimal corner radius (4px)
- **Primary:** Electric Purple (Light) / Acid Lime (Dark) background with black border and black text
- **States:** Hover expands shadow, active presses flat

### Cards / Containers
- **Corner Style:** Sharp corners (4px radius)
- **Background:** White solid background
- **Shadow:** Deep Shadow offset block
- **Borders:** Thick 3px black borders

### Inputs / Fields
- **Style:** Opaque white background, 3px black border
- **Focus:** Add a flat black shadow block behind the input

## 6. Do's and Don'ts

### Do:
- **Do** wrap every component in a solid `3px` black border.
- **Do** use uppercase and bold display headlines.
- **Do** align data counts to JetBrains Mono with light-yellow highlight blocks.

### Don't:
- **Don't** use color gradients, transparency values, or blur filters.
- **Don't** use circular border-radiuses above 4px on cards or buttons (except full pill labels).
- **Don't** use soft-gray border lines or fuzzy drop shadows.
