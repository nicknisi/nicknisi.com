# Implementation Spec: AI-Native DX Personal Site - Phase 1

**Contract**: ./contract.md
**Estimated Effort**: L

## Technical Approach

Replace the incumbent visual world through the Impeccable redesign workflow before editing production UI. `PRODUCT.md` is the product-truth authority. The existing purple/teal lineage, content, theme support, semantics, and Astro constraints are evidence, but the current risograph/zine system is not visual authority for this redesign.

Follow Impeccable `reference/new-work.md` for a Persuade-mode replacement world: derive grounded directions from Nick’s real cultural and professional world, run the required direction seed, present the assigned direction and challengers through the visual decision page, then visualize three compositions for the chosen direction. Do not copy Zack Proser’s visual system. His site is a benchmark for hierarchy, specificity, proof, and commercial clarity only.

Once Nick approves a direction and composition, implement the shared visual foundation and global chrome. Preserve Astro/Tailwind 4 conventions, semantic markup, existing theme persistence, reduced-motion handling, and route behavior. Do not write `DESIGN.md` yet; Impeccable records it from the shipped system during Phase 4.

## Decisions Considered and Rejected

- **Use nicknisi.com as the canonical public brand** — rejected: separate Nick Nisi and Typed Void public brands. Clients hire Nick’s reputation; two brands split maintenance and credibility.
- **Establish authority before selling** — rejected: a workshop-first sales funnel. The commercial path should be credible because of the surrounding work.
- **Position Nick around AI-native developer experience** — rejected: generic AI expertise, tooling alone, or education alone. AI-native DX unifies current leadership, engineering, and teaching.
- **Use Impeccable to select and execute the visual world** — rejected: copy Zack Proser or silently continue the incumbent zine system. The design must be specifically authored for Nick.

## Feedback Strategy

**Inner-loop command**: `pnpm run typecheck`

**Playground**: Astro dev server at `http://localhost:8080`, with paired desktop/mobile and light/dark screenshots after the approved composition is implemented.

**Why this approach**: The work is visual and responsive, so the browser is the primary playground while typecheck catches Astro and component regressions quickly.

## File Changes

### New Files

| File Path | Purpose |
| --- | --- |
| `.impeccable/surface-briefs/src-pages-index-astro.md` | Durable homepage strategy written through Impeccable’s surface-brief command if the tool resolves to this path. |
| Approved Impeccable decision/sketch artifacts under `.impeccable/` | Direction and composition evidence; exact generated filenames come from the Impeccable tools. |

### Modified Files

| File Path | Changes |
| --- | --- |
| `src/styles/base.css` | Replace tokens and shared primitives with the approved visual world; preserve accessible theme and prose behavior. |
| `src/layouts/Base.astro` | Add the auditable Impeccable direction contract as the first emitted body child and support the approved page-scale composition. |
| `src/components/Header.astro` | Rebuild navigation in the approved world with clear hierarchy and responsive behavior. |
| `src/components/Footer.astro` | Rebuild the close and supporting navigation without competing with the primary workshop action. |
| `src/components/ThemeToggle.astro` | Preserve persistence and accessibility while restyling the control in the approved system. |
| `src/components/AccentSwitcher.astro` | Remove, retain, or restyle only as dictated by the approved direction; avoid user-customization machinery that weakens a committed identity. |
| `src/components/Head.astro` | Load any approved typography and preserve metadata/theme initialization behavior. |

### Deleted Files

Delete no file by default. Remove an incumbent-only component only when the approved design makes it unused and the same phase removes every import.

## Implementation Details

### Impeccable Product and Direction Gate

**Pattern to follow**: `/Users/nicknisi/.pi/agent/skills/impeccable/reference/new-work.md`

**Overview**: Complete the mandatory replacement-world process before production UI edits.

**Implementation steps**:

1. Confirm `PRODUCT.md` exists and is current.
2. Name the site’s unique mechanism, audience scene, cultural home, category rut, and opposite.
3. Derive seven viable, concrete visual worlds spanning at least three material families.
4. Run `concept-seed.mjs --scope direction --mode persuade` and acknowledge the assigned direction.
5. Present the assigned direction, up to three challengers, re-roll/steer, and the category-standard exit using Impeccable’s decision page.
6. Open the selected direction’s quality-bar references.
7. Because image generation is available, follow Impeccable `visualize.md`: render three composition options in a shared frame and get Nick’s approval.
8. Write the selected direction contract into the root layout before implementation. Include THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM/seed key, and the required FINISH line.

**Feedback loop**:

- **Playground**: Impeccable decision page and composition comparison.
- **Experiment**: Compare directions on audience identification and product clarity; compare compositions on five-second comprehension, workshop-action visibility, and unmistakable Nick authorship.
- **Check command**: `grep -R "THESIS:" -n src/layouts/Base.astro`

### Shared Visual Foundation

**Pattern to follow**: `src/styles/base.css`

**Overview**: Replace the incumbent tokens and component grammar rather than layering a second system on top.

**Key decisions**:

- Retain the purple/teal lineage only if it survives the approved direction; do not preserve token names or mint/lavender artifacts merely to avoid markup changes.
- Use one committed visual identity, not a visitor-selectable accent system, unless the approved direction proves customization is integral to Nick’s identity.
- Preserve unlayered prose overrides where Tailwind Typography’s cascade requires them.

**Implementation steps**:

1. Define the approved color strategy, typography, spacing, surfaces, border/elevation grammar, controls, and responsive rules in shared tokens/primitives.
2. Implement intentional light and dark scenes rather than mechanical color inversion.
3. Preserve focus-visible, selection, reduced-motion, and semantic heading behavior.
4. Remove incumbent utilities only after all current consumers compile against the replacement primitives.

**Feedback loop**:

- **Playground**: A representative page matrix in the running Astro site: `/`, `/posts`, and one article.
- **Experiment**: Inspect at 390×844 and 1440×1000 in both themes; test long navigation labels, keyboard focus, reduced motion, and prose code/blockquote states.
- **Check command**: `pnpm run typecheck`

### Global Chrome and Theme Controls

**Pattern to follow**: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`

**Overview**: Make the global frame communicate a clear personal authority site without turning every page into a workshop ad.

**Implementation steps**:

1. Rebuild desktop and mobile navigation with Workshops as the visible primary destination.
2. Keep writing, speaking, and about routes quickly discoverable.
3. Preserve theme state across navigation and ensure the toggle has a stable accessible name and state.
4. End pages with a deliberate close, contact path, and legal/business attribution where appropriate.
5. Remove stale venture duplication that conflicts with nicknisi.com as the canonical public brand.

**Feedback loop**:

- **Playground**: Astro dev server with keyboard-only navigation.
- **Experiment**: Open/close mobile nav, traverse all controls, toggle themes on three routes, navigate, and confirm the selected theme persists.
- **Check command**: `pnpm run typecheck`

## Testing Requirements

### Manual Testing

- [ ] Nick approves the Impeccable visual direction.
- [ ] Nick approves one of three visualized compositions.
- [ ] The emitted production markup retains the direction-contract seed key.
- [ ] Header, footer, theme control, and mobile navigation work with keyboard and pointer input.
- [ ] Homepage, post index, and representative article remain readable in light/dark at desktop/mobile widths.

## Failure Modes

| Component | Failure Mode | Trigger | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| Direction process | Competitor imitation | Zack’s site is treated as a visual template | Site feels derivative and fails the authorship goal | Use Zack only for hierarchy/proof; require Impeccable direction selection and Nick approval. |
| Visual foundation | Two systems coexist | New tokens are layered over incumbent utilities | Inconsistent pages and theme inversion | Replace shared primitives deliberately and migrate consumers before deleting legacy rules. |
| Dark theme | Mechanical inversion | Light-scene colors are rebound without contextual surfaces | Illegible prose or controls | Design a distinct dark physical scene and inspect representative surfaces. |
| Navigation | Workshop action overwhelms archive | CTA treatment dominates every route | Personal site becomes a sales funnel | Keep one clear action while preserving writing/speaking hierarchy. |
| Theme control | State or hydration regression | Component restyle changes its script/ARIA behavior | Wrong theme or inaccessible control | Preserve behavior first; verify state persistence and keyboard use. |

## Validation Commands

```bash
pnpm run typecheck
pnpm run build
grep -R "THESIS:" -n src/layouts/Base.astro
grep -R "FINISH: unreviewed and undocumented is unfinished" -n dist/index.html
```

## Rollout Considerations

- **Feature flag**: None. Work lands on the isolation branch and is reviewed as a complete visual system.
- **Rollback plan**: Delete the isolation branch if the replacement direction fails; do not partially merge a half-migrated visual system.

## Open Items

None. Visual direction and composition are execution-time human gates owned by Impeccable.

---

_This spec is ready for implementation. Follow the patterns and validate at each step._
