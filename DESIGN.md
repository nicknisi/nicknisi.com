---
name: Nick Nisi

description: Documentary field evidence for an AI-native developer experience practice.
colors:
  signal-purple: "#724bb7"
  signal-teal: "#17b897"
  light-paper: "oklch(0.975 0.008 300)"
  light-surface: "oklch(0.995 0.004 300)"
  light-ink: "oklch(0.22 0.025 294)"
  light-muted: "oklch(0.45 0.025 294)"
  light-rule: "oklch(0.84 0.02 294)"
  dark-paper: "oklch(0.165 0.02 294)"
  dark-surface: "oklch(0.225 0.026 294)"
  dark-ink: "oklch(0.95 0.01 300)"
  dark-muted: "oklch(0.77 0.018 294)"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(3.65rem, 8vw, 8rem)"
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  control: "0.35rem"
  media: "0.5rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-purple}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.72rem 1.1rem"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.light-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.72rem 1.1rem"
    height: "44px"
---

# Design System: Nick Nisi

## Overview

**Creative North Star: "The Single Event"**

The system treats Nick's current practice as one human event with four evidence paths: Build, Teach, Write, and Speak. Documentary photography and plain-language claims lead; fine rules and purple/teal signals connect the work without turning the interface into a dashboard. The visual world is technical but not terminal-coded, editorial but not dense, and personal without becoming casual.

Light mode is cool paper under ordinary working light. Dark mode is the same publication after hours: deep violet-black rather than flat OLED black, with lifted surfaces and warm-white text. The pixel-art beef guy is the signature mark, deliberately small beside real photography and professional evidence.

**Key Characteristics:**

- Large documentary fields paired with concise, compressed display type
- Purple for primary action and teal for active evidence
- Hairline rules, sparse tracks, and generous editorial space
- Equal light and dark scenes rather than mechanical inversion
- One small beef-guy mark in global chrome and the closing surface

## Colors

Purple and teal are signals, not page paint. Most of every surface remains paper, ink, documentary media, and hairline structure.

### Primary

- **Signal Purple**: Primary actions, selected evidence, and high-value links.

### Secondary

- **Signal Teal**: Active tracks, focus, bullets, and small connective marks.

### Neutral

- **Cool Paper / Violet-Black Paper**: Theme-specific page grounds.
- **Field Surface**: Slightly lifted containers and media support.
- **Violet Ink / Warm-White Ink**: Primary text.
- **Muted Ink**: Supporting prose; faint labels retain normal-text contrast.
- **Hairline Rule**: Separates tracks and regions without creating cards.

**The Signal Rarity Rule.** Purple and teal identify action or relationship. They do not fill arbitrary sections or decorate every heading.

**The Equal Themes Rule.** Every shared component must have an intentional paper, surface, ink, muted-ink, and rule value in both themes.

## Typography

**Display Font:** Bricolage Grotesque Variable

**Body Font:** Atkinson Hyperlegible

**Label/Mono Font:** JetBrains Mono Variable

**Character:** Bricolage supplies compact, forceful editorial headlines. Atkinson keeps long-form reading human and highly legible. JetBrains Mono is reserved for factual labels, dates, categories, and evidence coordinates.

### Hierarchy

- **Display** (800, up to 8rem, 0.82 line height): First-view thesis only.
- **Headline** (800, up to 6rem, 0.95 line height): Major section statements.
- **Title** (700, 1.5–2rem): Articles, talks, and evidence items.
- **Body** (400, 1.0625rem, 1.5): Prose and explanations; long-form measure stays at or below 72ch.
- **Label** (500, 0.7rem, 0.12em tracking, uppercase): Metadata and evidence coordinates.

**The Plain Thesis Rule.** The main heading carries the idea itself. Do not place an eyebrow or kicker above it.

**The Mono Evidence Rule.** Monospace communicates real metadata. It never serves as a generic “technical” costume for body copy.

## Layout

Global chrome and primary surfaces use a 7xl maximum width with 1.25rem mobile and 2rem desktop gutters. Primary page sections use approximately 6rem vertical separation. The signature first viewport is an editorial split: a documentary image field and a thesis field, followed by four rule-separated evidence tracks.

Desktop layouts may split asymmetrically when one side carries evidence and the other interpretation. Mobile stacks media above thesis, reduces media height, and keeps the primary action inside the initial 390×844 viewport. Content indexes use open columns or rows separated by rules rather than a wall of enclosed cards.

## Elevation & Depth

The system is flat by default. Depth comes from tonal separation, photography, border rules, and occasional ambient shadows on genuinely lifted media or legacy surfaces. Shadows are soft, broad, and low-contrast; hard offset shadows are not part of this world.

### Shadow Vocabulary

- **Ambient Small** (`0 8px 24px` with 8% ink): Optional media or lifted utility surface.
- **Ambient Field** (`0 18px 52px` with 12% ink): Rare emphasis for one major contained field.

**The Flat Evidence Rule.** Evidence tracks, article rows, and workshop principles use rules and whitespace rather than card elevation.

## Shapes

Controls use tight 0.35rem corners. Media uses restrained 0.5rem corners when it is freestanding; full editorial fields may be square and rule-bounded. Pills are limited to compact tags or legacy leaf routes and never structure a page. Concentric event geometry may appear once as a sparse connective signature, never as particle wallpaper.

## Components

### Buttons

- **Shape:** Compact corners, minimum 44px height.
- **Primary:** Signal purple with white text and 0.72rem × 1.1rem padding.
- **Hover / Focus:** Two-pixel rise on hover; teal two-pixel focus outline with four-pixel offset.
- **Ghost:** Transparent field with a hairline rule and primary ink.

### Cards / Containers

- **Corner Style:** Restrained or square according to whether the region is a discrete object or an editorial field.
- **Background:** Theme surface token.
- **Shadow Strategy:** Flat by default.
- **Border:** One-pixel hairline.
- **Internal Padding:** 1.5–2.25rem for genuine standalone objects.

### Navigation

The beef guy and Nick Nisi form the home mark. Writing, Speaking, and About remain quiet text links; Workshops is the sole filled action. Active links use a one-pixel teal underline. Mobile navigation opens as a simple stacked document menu, not a modal.

### Evidence Tracks

Build, Teach, Write, and Speak use small mono labels, one hairline lead-in, a concise title, and one sentence of evidence. The active path may use a quiet purple field or purple rule, but all four retain equal semantic weight.

### Theme Toggle

A 40px square switch with a real sun/moon icon and an accessible state label. It persists the visitor's choice and restores it before paint and after Astro transitions.

## Do's and Don'ts

### Do:

- **Do** lead major persuasive surfaces with real Nick photography and source-backed claims.
- **Do** use purple for the primary action and teal for active evidence or focus.
- **Do** leave generous space around one strong thesis and a small number of proof paths.
- **Do** keep the beef guy visible but subordinate to documentary evidence.
- **Do** verify the light and dark scenes independently at mobile and desktop widths.

### Don't:

- **Don't** imitate Zack Proser's numbering, fire metaphor, or page topology; borrow only confidence, proof, and clarity.
- **Don't** build equal icon-heading-body card grids as the page's primary structure.
- **Don't** add particle wallpaper, fake metrics, terminal chrome, neon glow, glass, or sci-fi dashboard controls.
- **Don't** use mint, yellow, or red as dominant brand fields.
- **Don't** use generated people as documentary evidence.
- **Don't** revive the prior sticker collage, random accent switcher, hard shadows, or background pattern.
