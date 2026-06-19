# Business Site Architecture: nicknisi.com + Typed Void + Side Effects

**Date:** 2026-06-19
**Status:** Approved (design); Part A ready to implement, Part B to be planned

## Problem

Nick is launching **Typed Void LLC**, a consulting/services vehicle (AI-native
engineering training, dev consulting, contracting), with the domain
`typedvoid.com`. He also co-owns **Dev Dilemmas LLC (DBA Side Effects)** with a
friend. He already has an established personal site, `nicknisi.com`.

The question: how should these relate? Should content be duplicated? Should the
personal site advertise the business heavily?

## Decisions

| Question | Decision |
|---|---|
| Typed Void's purpose | Consulting/services vehicle (sells Nick's time/expertise) |
| Duplicate content across domains? | No — divide content *by job*, cross-link once each way |
| Heavily advertise Typed Void on nicknisi.com? | No — one intentional pointer, not scattered plugs |
| Where does the training offer live? | Authoritative on typedvoid.com; nicknisi.com keeps a version with `rel=canonical` → typedvoid ("both, with canonical") |
| Side Effects | Link-only from the hub; do not build here (co-owned, its own site) |
| typedvoid.com codebase | Separate standalone Astro repo (its own company identity) |

## Architecture: Hub & Spokes

```
        nicknisi.com   ← reputation hub (peers, community)
         /        \
   typedvoid.com   Side Effects (devdilemmas)
   storefront       co-owned, external — link only
   (buyers)
```

Three roles, no overlap:

- **nicknisi.com — the reputation engine.** Audience: peers, the dev community,
  conference organizers. Posts, talks, `uses`, `now`, resume. Nick is
  *interesting* here, not selling. Trust built here *feeds* the business. Stays
  as-is except for two small additions (Part A).
- **typedvoid.com — the storefront.** Audience: people deciding whether to hire
  Nick. Lean, conversion-focused, birdcar.dev-shaped, with its own
  company-feeling identity. Standalone repo (Part B).
- **Side Effects — co-owned venture.** Lives on its own; the hub just links to it.

### Linking rules (the part people get wrong)

- **Hub → spokes:** one "Work / Ventures" area listing Typed Void (primary) +
  Side Effects, plus a single footer line. NOT sprinkled across every page.
- **Spoke → hub:** typedvoid.com's About/Writing links *back* to nicknisi.com —
  Nick's personal reputation is the company's credibility (birdcar.dev does
  exactly this).
- **Training page:** typedvoid.com is authoritative. nicknisi.com's
  `/ai-engineering` carries `rel=canonical` pointing at the typedvoid training
  URL. This satisfies "both, with canonical" and avoids any duplicate-content
  penalty.

### Why not the alternatives

- **Duplicate full content on both domains (no canonical):** SEO penalty +
  ongoing sync burden. Rejected.
- **Fold everything into nicknisi.com (no separate business site):** turns the
  personal brand into a sales page and gives buyers no clean front door.
  Rejected.
- **Monorepo for both sites:** viable, but more restructuring of a working site
  than warranted when the only genuinely shared artifact is one page (handled
  by canonical). Rejected in favor of a standalone repo. Revisit if a third
  Nick-owned site appears.

## Current-state facts (verified)

- `nicknisi.com` is a **static** Astro site (`output: 'static'`), single package
  (the `pnpm-workspace.yaml` only allowlists native build deps), `site:
  'https://nicknisi.com'`, almost certainly deployed to Cloudflare (`workerd`
  build dep). Static ⇒ multi-domain is trivial.
- Nav (`src/components/Header.astro`) and footer (`src/components/Footer.astro`)
  both already surface a **Training** CTA → `/ai-engineering`.
- `src/pages/ai-engineering.astro` is **already a complete, conversion-grade
  landing page** for "The AI-Native Engineer": hero, problem, reframe, social
  proof, 5-module curriculum, leaders section, add-ons, how-it-works,
  deliverables, instructor bio, fit-check, a React **pricing calculator**
  (`landing/PricingCalculator`, `client:only="react"`), FAQ, CTAs. It uses a
  `landing/` component set (`Section`, `CTA`, `StatCard`, `PricingCalculator`),
  the `Base.astro` layout, and a neo-brutalist token system (`sticker`,
  `panel`, `shadow-hard-*`, accent colors, `font-display`).
- `src/data/metadata.json` holds site metadata, a `links` array, `social` map,
  etc. — the natural home for venture links.

## Scope

### Part A — nicknisi.com hub changes (this repo, small)

1. **Ventures linking pattern.** Surface Nick's ventures from the hub without
   letting them take it over:
   - Add a `ventures` array to `src/data/metadata.json` (Typed Void → primary,
     with a one-line descriptor + URL; Side Effects → URL + co-owned note).
   - Render it in one place of prominence — a small "Ventures" group in
     `Footer.astro` — and optionally a line on the About page. Keep it quiet.
2. **Training canonical.** Add `rel=canonical` on `/ai-engineering` pointing at
   the typedvoid training URL (e.g. `https://typedvoid.com/ai-native-engineer`).
   - **Sequencing:** only ship the canonical once typedvoid.com is live with
     that page, or the canonical target 404s. Until then, the linking pattern
     can ship independently.
   - Verify `Base.astro` / `Head.astro` supports a per-page `canonical` prop;
     add one if absent.

### Part B — typedvoid.com (new standalone repo, larger)

A separate Astro repo. Because the training landing page already exists, the
work is mostly assembly + a thin shell:

1. **Repo + tooling.** New standalone Astro project. Decide location/host
   (likely a new Cloudflare Pages project). Port the design-token system and the
   `landing/` component set (incl. the React `PricingCalculator`) and
   `Base`/`Page` layouts from nicknisi.com.
2. **Authoritative training page.** Port `ai-engineering.astro` as the canonical
   training page (e.g. `/ai-native-engineer`). This is the page nicknisi.com's
   canonical points at.
3. **Company shell (the storefront).** A lean home page in the birdcar.dev mold:
   - Hero / positioning (what Typed Void does, for whom)
   - Services overview (training as flagship; consulting/contracting)
   - How Nick works (engagement model, capacity)
   - About the founder → links back to nicknisi.com for credibility
   - One contact CTA (reuse the booking/email pattern already in the training
     page: Calendly + `mailto`)
4. **Identity & SEO.** Its own OG images, its own `site:` config, distinct
   company visual identity (need not be byte-identical to the personal brand).

**Open items for Part B planning:** new repo location/name, host setup, the
exact training URL slug (must match the canonical from Part A), and how distinct
the company visual identity should be from the personal site.

## Out of scope

- Building or restyling the Side Effects site (co-owned, separate effort).
- Any restructuring of nicknisi.com beyond the two Part A additions.
- Migrating nicknisi.com off static / changing its host.
