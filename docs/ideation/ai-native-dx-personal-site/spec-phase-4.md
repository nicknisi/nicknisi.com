# Implementation Spec: AI-Native DX Personal Site - Phase 4

**Contract**: ./contract.md
**Estimated Effort**: M

## Technical Approach

Finish through Impeccable’s bounded inspection and independent review process. This phase is not an open-ended polish loop and does not introduce a new visual direction. It verifies that the approved direction contract and composition survived implementation across the primary journey, evidence surfaces, themes, and responsive widths.

Capture desktop and mobile screenshots in one batched round, covering both themes for the highest-risk surfaces. Compare the homepage and workshops first viewports against the approved composition at matched dimensions. Fix material gaps in one batch, confirm with at most one additional inspection round, then run the Impeccable mechanical detector once.

Spawn the shipped `impeccable-finish-reviewer` fresh with the original request, confirmed answers, direction contract, approved direction/comp artifacts, screenshot paths, detector findings, and craft-floor reference. Resolve material findings through its verdict process. After the final verdict, spawn `impeccable-documenter` to write `DESIGN.md` and its sidecar from the shipped implementation. Do not hand-write a design system from intention.

## Decisions Considered and Rejected

- **Use Impeccable to select and execute the visual world** — rejected: copy Zack Proser or silently preserve the incumbent system. Finish review judges against the approved Nick-specific direction.
- **Redesign core system and perception-shaping pages** — rejected: bespoke every specialty route. Review focuses on approved scope and representative inherited surfaces.
- **Establish authority before selling** — rejected: sales-funnel treatment. Review must confirm clarity and action without workshop chrome overwhelming reading/evidence surfaces.
- **Target Stretch** — signature motion and expanded media are allowed only if core clarity, accessibility, responsiveness, and performance remain intact.

## Feedback Strategy

**Inner-loop command**: `pnpm run build`

**Playground**: Production build served locally, with deterministic screenshot paths for desktop/mobile and light/dark surfaces.

**Why this approach**: Final validation must exercise production output and provide durable visual evidence to an independent reviewer.

## File Changes

### New Files

| File Path | Purpose |
| --- | --- |
| `DESIGN.md` | Shipped visual-system documentation created by the Impeccable documenter after final review. |
| Impeccable design sidecar at the path chosen by the documenter | Machine-readable or auxiliary design-system evidence required by the current Impeccable version. |
| `.impeccable/review/*.png` or equivalent project-local screenshot paths | Durable desktop/mobile and light/dark review evidence; exact names may follow the tool workflow. |

### Modified Files

Any in-scope source file named by a material finish-review finding. Do not reopen unrelated routes or make taste-only changes after the inspection ceiling.

### Deleted Files

Delete ephemeral comparison artifacts only after their decisions are captured by the approved direction/comp records. Preserve evidence required by the finish reviewer and documenter.

## Implementation Details

### Production Validation and Screenshot Matrix

**Pattern to follow**: `/Users/nicknisi/.pi/agent/skills/impeccable/reference/new-work.md` section 7 and the current `verify-behavior` skill for checked UI postconditions.

**Overview**: Build production output and capture the minimum complete evidence set in one round.

**Required surfaces**:

- Homepage: desktop/mobile, light/dark.
- Workshops: desktop/mobile, light/dark.
- About: desktop/mobile in the primary theme and dark spot-check.
- Speaking: desktop/mobile in the primary theme and dark spot-check.
- Posts index: desktop/mobile, light/dark.
- Representative article: desktop/mobile, light/dark, including code/prose if available.

**Implementation steps**:

1. Run typecheck and production build.
2. Serve the production output or use the project’s supported preview command.
3. Capture the matrix in a single batched browser round.
4. For homepage/workshops, capture matched first-viewport crops beside the approved composition; compare scale, density, materials, controls, and reading order.
5. Inspect keyboard focus, mobile navigation, theme persistence, reduced motion, workshop external CTA, legacy `/ai-engineering` redirect, and representative archive links with checked postconditions.
6. Batch all material fixes, rebuild, and capture at most one confirmation round.

**Feedback loop**:

- **Playground**: Production preview.
- **Experiment**: Exercise desktop/mobile, themes, keyboard focus, nav state, cross-domain CTA, long article/code overflow, and disabled/reduced motion.
- **Check command**: `pnpm run build`

### Mechanical Design Detector

**Pattern to follow**: Impeccable context directive for this project.

**Overview**: Run the detector exactly once after UI changes are complete.

**Implementation steps**:

1. Invoke `node /Users/nicknisi/.pi/agent/skills/impeccable/scripts/detect.mjs --json` with the changed UI targets.
2. Fix mechanical findings that do not conflict with the approved direction.
3. Pass unresolved/contextual findings to the finish reviewer.
4. Do not run a second detector.

### Independent Finish Review

**Overview**: Use a fresh reviewer that has screenshots and decision evidence but does not inherit the build thread’s optimism.

**Implementation steps**:

1. Spawn `impeccable-finish-reviewer` with fresh context.
2. Include original request, user answers, artifact paths, screenshot paths, direction contract, detector findings, quality-bar card, approved composition, and craft-floor reference path.
3. Require the returned five contract sections and disposition.
4. If the first material finding is a rebuild directive, rebuild the named regions before patching details.
5. Otherwise apply material fixes in one batch, rebuild, recapture the same viewports, and continue the same reviewer for a scored verdict.
6. After two attended review rounds, put any unresolved material findings and verdict in front of Nick instead of silently polishing further.

### Design-System Documentation

**Pattern to follow**: `/Users/nicknisi/.pi/agent/skills/impeccable/reference/document.md`

**Overview**: Record the system that actually shipped.

**Implementation steps**:

1. Spawn `impeccable-documenter` after the final review verdict.
2. Provide project root, artifact paths, direction contract, `PRODUCT.md`, document reference, and write boundary.
3. Verify `DESIGN.md` and its sidecar exist and describe rendered implementation rather than initial intentions.
4. Confirm the production build still includes the auditable direction-contract seed key.

### Final Contract Verification

**Implementation steps**:

1. Run every command-backed criterion from `contract-data.json` using `scripts/verify.mjs` or directly if required by the execution harness.
2. Record judgment outcomes without claiming automation can certify them.
3. Report residual risks and unresolved reviewer findings honestly.

## Testing Requirements

### Manual Testing

- [ ] Homepage first viewport communicates Nick, AI-native DX, proof, and Workshops within five seconds.
- [ ] Workshops clearly states Nick’s role and shared crew, and hands off to the verified booking destination.
- [ ] Design feels specifically authored for Nick and distinct from Zack’s visuals.
- [ ] Homepage, workshops, posts, and representative article pass desktop/mobile light/dark review.
- [ ] Keyboard navigation, focus, theme persistence, reduced motion, mobile nav, and external CTA work.
- [ ] Stretch motion/media strengthens the approved direction and degrades gracefully.
- [ ] Finish reviewer returns a final disposition and finding table.
- [ ] `DESIGN.md` is produced by the documenter from the shipped world.

## Failure Modes

| Component | Failure Mode | Trigger | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| Inspection | Full-page thumbnails hide defects | Entire tall pages are judged at tiny scale | Wrong scale, crude controls, or overflow survives | Use matched viewport and region crops at legible scale. |
| Finish loop | Endless taste polishing | Builder reopens visual judgment after each screenshot | Cost rises and direction drifts | Two inspection rounds maximum; reviewer findings are the only fix list. |
| Reviewer | Inherited optimism | Reviewer receives build-thread context instead of evidence packet | Material issues are rationalized away | Spawn fresh and pass explicit artifacts/screenshots. |
| Stretch motion | Signature interaction harms clarity/performance | Motion is added before core behavior is proven | Accessibility or comprehension regressions | Keep content visible by default, honor reduced motion, remove motion if it fails review. |
| Documentation | DESIGN.md records intention | Written before implementation stabilizes | Future work follows rules that do not match the site | Generate from shipped source/render only after final verdict. |
| Verification | Judgment presented as automated pass | Build/typecheck are treated as proof of visual quality | False completion claim | Separate command and human-review evidence in the final report. |

## Validation Commands

```bash
pnpm run typecheck
pnpm run build
test -f dist/index.html && test -f dist/workshops/index.html && test -f dist/about/index.html && test -f dist/speaking/index.html && test -f dist/posts/index.html && test -f dist/posts/ai-tooling/index.html
grep -q 'data-surface="homepage-authority"' dist/index.html
grep -q 'data-surface="workshops"' dist/workshops/index.html
grep -q "'/ai-engineering': '/workshops'" astro.config.ts
grep -R "FINISH: unreviewed and undocumented is unfinished" -n dist/index.html
test -f DESIGN.md
```

Run the contract verifier at completion:

```bash
node /Users/nicknisi/Developer/ideation/scripts/verify.mjs docs/ideation/ai-native-dx-personal-site/contract-data.json
```

## Rollout Considerations

- **Feature flag**: None; release through branch review and deployment preview.
- **Monitoring**: Verify production routes, canonicals, redirects, workshop handoff, and theme behavior immediately after deploy.
- **Rollback plan**: Revert phase commits or delete the isolation branch before merge. Do not revert and then rerun autopilot on the same branch because phase-commit detection may treat reverted work as complete.

## Open Items

None. Any unresolved second-round visual finding becomes an explicit Nick ship/continue decision, not silent debt.

---

_This spec is ready for implementation. Follow the patterns and validate at each step._
