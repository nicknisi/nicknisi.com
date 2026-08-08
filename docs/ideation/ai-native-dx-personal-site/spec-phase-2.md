# Implementation Spec: AI-Native DX Personal Site - Phase 2

**Contract**: ./contract.md
**Estimated Effort**: L

## Technical Approach

Build the two Persuade surfaces that define the new visitor journey: an authority-led homepage and a Nick-centered workshops page. Both must use the approved Phase 1 visual world and composition grammar. The homepage establishes who Nick is, what AI-native DX means in practice, and why his judgment is credible before asking the visitor to explore workshops.

The workshops page is not a duplicate of Zack Proser’s long-form sales page. It explains Nick’s perspective and role, shows verified teaching and collaboration evidence, introduces the shared crew/format at the level necessary for confidence, and hands qualified visitors to `https://zackproser.com/contact`, the verified destination behind Zack’s workshop booking CTAs. Claims must come from local evidence or the fetched source; do not copy prices, availability, scale, outcomes, or deliverable counts unless Nick explicitly confirms they should be canonical on his site.

Use existing Astro components only where their structure fits the approved world. Prefer route-local composition over creating generic section frameworks for two pages.

## Decisions Considered and Rejected

- **Establish authority before selling** — rejected: workshop-first sales funnel. Technical leaders should understand Nick’s judgment before encountering the primary action.
- **Create a Nick-centered workshops page with shared booking handoff** — rejected: link-only treatment or a complete duplicate of Zack’s sales page. Nick needs ownership without competing canonical offer copy.
- **Position Nick around AI-native developer experience** — rejected: generic AI expert, tooling-only, or educator-only positioning. This connects leadership, systems, adoption, and teaching.
- **Use Impeccable’s approved visual world** — rejected: copy Zack’s visuals or regress to the incumbent zine system.

## Feedback Strategy

**Inner-loop command**: `pnpm run typecheck`

**Playground**: Astro dev server at `http://localhost:8080`, focused on `/`, `/workshops`, and `/ai-engineering`.

**Why this approach**: These are content-rich persuasive pages; rapid browser iteration plus typecheck is the shortest useful loop.

## File Changes

### New Files

| File Path | Purpose |
| --- | --- |
| `src/pages/workshops.astro` | Nick-centered workshop authority and handoff page. |
| Route-local components under `src/components/workshops/` only if a section has real interactive or repeated structure | Keep the page readable without inventing a generic landing-page framework. |

### Modified Files

| File Path | Changes |
| --- | --- |
| `src/pages/index.astro` | Replace the current general-DX hero and latest-posts-only hierarchy with the approved authority journey. |
| `src/components/Header.astro` | Ensure Workshops is the primary visible destination while keeping writing/speaking accessible. |
| `src/components/Footer.astro` | Align the closing workshop/contact path and Typed Void attribution. |
| `astro.config.ts` | Add `/ai-engineering` → `/workshops` redirect while preserving existing redirects. |
| `src/data/metadata.json` | Update current positioning and remove obsolete training-canonical/venture assumptions if no longer consumed. |
| `src/components/sections/Posts.astro` | Support curated authority evidence if the existing limit-only interface cannot express it simply. |
| `src/components/sections/Appearances.astro` | Support selected workshop/talk evidence if current promoted data is insufficient. |

### Deleted Files

| File Path | Reason |
| --- | --- |
| `src/pages/ai-engineering.astro` | Replaced by the focused workshops page after its public URL redirects; delete only once `/workshops` contains all retained, verified value. |
| Unused `src/components/landing/*` files | Remove only components made orphaned by deleting the old AI engineering page. Keep any component still used elsewhere. |

## Implementation Details

### Authority-Led Homepage

**Pattern to follow**: `src/pages/index.astro` for route integration; use the approved Phase 1 composition rather than incumbent markup.

**Overview**: The first viewport must identify Nick, AI-native DX, concrete credibility, and the workshop path within five seconds.

**Key decisions**:

- Primary audience: technical leaders.
- Primary action: Explore workshops.
- Writing, talks, projects, and current role are proof, not equal competing CTAs.
- Weekly streaming is current supporting evidence but not the central identity.

**Implementation steps**:

1. Add `data-surface="homepage-authority"` to the semantic main authority surface for stable verification.
2. Implement the approved first viewport with Nick’s name, AI-native DX thesis, current role/leadership proof, and primary `/workshops` action.
3. Build a proof sequence using only verified local content: current AI/tooling writing, recent talks/workshops, longstanding tooling/community work, and selected projects.
4. Curate rather than dump. Keep recent writing accessible without letting the chronological feed define the homepage.
5. Include one restrained path for readers/practitioners and a deliberate final workshop/contact close.
6. Use current images from `src/assets/` when they strengthen proof; author no synthetic documentary evidence.

**Feedback loop**:

- **Playground**: `/` at 1440×1000 and 390×844, both themes.
- **Experiment**: Run a five-second first-viewport review; then test long titles, no recent posts, and image loading disabled to ensure hierarchy survives.
- **Check command**: `pnpm run typecheck`

### Nick-Centered Workshops Page

**Pattern to follow**: `src/pages/ai-engineering.astro` for existing source-backed material; `https://zackproser.com/workshops/claude-cowork` for verified shared-offer facts, not visual composition.

**Overview**: Establish Nick’s role and philosophy, show workshop mechanics and evidence, identify the shared crew, and route to the verified booking destination.

**Source-backed content available**:

- Nick is presented as EM of WorkOS DX/AI, a staff engineer and AI practitioner, owner of internal harnesses, and co-instructor at AIE New York and London.
- The shared offer uses hands-on, mixed-skill pods with embedded practitioners and a rotating keyboard.
- The crew includes Zack Proser, Nick Nisi, and Nick Cannariato.
- Zack’s public workshop booking CTAs resolve to `https://zackproser.com/contact`.
- Local assets include recent AIE Europe workshop/talk photography and a WorkOS Claude skills presentation image.

**Implementation steps**:

1. Add `data-surface="workshops"` to the primary workshops surface.
2. Write a Nick-first opening: the adoption/problem framing and what he specifically brings, without claiming sole ownership of the shared offer.
3. Explain the workshop as hands-on organizational practice, not a lecture or generic AI course.
4. Present Nick’s verified role, selected teaching evidence, and the three-person crew clearly.
5. Include verified workshop mechanics and artifacts only to the level supported by sources and approved by Nick.
6. Use `https://zackproser.com/contact` as the primary booking handoff; make the cross-domain transition explicit.
7. Add a compact FAQ only for objections answered by verified source material; omit speculative answers.
8. Use event photography with useful alt text and responsive image handling.

**Feedback loop**:

- **Playground**: `/workshops` in the Astro dev server.
- **Experiment**: Review as a skeptical VP of Engineering: identify who leads it, who it is for, what happens, what is proven, and where booking goes. Repeat at mobile width and with images disabled.
- **Check command**: `pnpm run typecheck`

### Legacy Route and Data Cleanup

**Pattern to follow**: `astro.config.ts` existing `redirects` object.

**Overview**: Preserve inbound links while removing the competing/obsolete training surface.

**Implementation steps**:

1. Add `'/ai-engineering': '/workshops'` to Astro redirects.
2. Update all internal links from `/ai-engineering` to `/workshops`.
3. Remove stale training-canonical configuration once no consumer remains.
4. Keep Typed Void as legal attribution rather than a competing venture CTA.
5. Build and inspect the generated redirect artifact.

## Testing Requirements

### Manual Testing

- [ ] Five-second homepage review identifies Nick, AI-native DX, proof, and workshops action.
- [ ] Workshops page accurately distinguishes Nick’s perspective from the shared crew offer.
- [ ] Every external booking CTA resolves to `https://zackproser.com/contact` and clearly signals the destination.
- [ ] Workshop imagery is real, relevant, responsive, and carries accurate alt text.
- [ ] `/ai-engineering` redirects to `/workshops`.
- [ ] Homepage and workshops remain clear in both themes at desktop/mobile widths.

## Failure Modes

| Component | Failure Mode | Trigger | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| Homepage | Authority becomes vague hype | Copy says “AI leader” without concrete work | Technical leaders distrust the positioning | Pair each claim with role, artifact, talk, article, project, or workshop evidence. |
| Homepage | Too many equal paths | Writing, speaking, projects, streaming, and workshops all receive primary CTA weight | No clear next step | Keep Workshops primary; evidence paths secondary. |
| Workshops | Competing canonical offer | Nick’s page repeats mutable price/availability/deliverable details | Sites drift and prospects see contradictions | Keep offer detail bounded and hand off to Zack’s verified contact flow. |
| Workshops | Role inflation | Shared workshop facts are rewritten as Nick-only achievements | Inaccurate positioning | Name the crew and distinguish Nick’s contribution explicitly. |
| Booking | Silent cross-domain jump | CTA label hides destination | Visitor confusion or trust loss | Label the shared booking flow and use ordinary external-link semantics. |
| Legacy route | Broken inbound links | Old page is deleted without redirect | Existing links 404 | Add and build-verify Astro redirect before deletion. |

## Validation Commands

```bash
pnpm run typecheck
pnpm run build
test -f dist/index.html
test -f dist/workshops/index.html
grep -q 'data-surface="homepage-authority"' dist/index.html
grep -q 'data-surface="workshops"' dist/workshops/index.html
grep -q "'/ai-engineering': '/workshops'" astro.config.ts
```

## Rollout Considerations

- **Feature flag**: None; land as one branch-level redesign.
- **Monitoring**: After launch, inspect broken-link reports and workshop-path usage if analytics already exist; do not add analytics in this phase.
- **Rollback plan**: Revert the phase commit; Astro redirect and old page deletion must be in the same commit.

## Open Items

None. Mutable commercial details remain on the shared booking site unless Nick explicitly supplies canonical replacements during execution.

---

_This spec is ready for implementation. Follow the patterns and validate at each step._
