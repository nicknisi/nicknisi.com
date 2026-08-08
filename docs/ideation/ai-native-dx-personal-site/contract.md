# AI-Native DX Personal Site Contract

**Created**: 2026-08-07
**Readiness**: All 5 gates ready
**Status**: Approved
**Approval**: Express — single consolidated confirmation, no per-artifact review
**Supersedes**: None

## Problem Statement

Technical leaders arriving at nicknisi.com encounter a visually energetic but dated positioning system that still describes Nick mainly as a TypeScript enthusiast, conference organizer, streamer, and developer experience engineer. That framing understates his current leadership and hands-on work in AI-native developer experience, so visitors evaluating workshops, speaking, or collaboration must assemble the relevant story themselves.

The site already contains substantial proof through writing, talks, projects, conference material, and workshop participation, but the homepage and key routes do not organize that evidence into a clear authority narrative or provide a Nick-owned workshop destination. A fresh visual system must change that perception without sacrificing the archive, readability, personality, or existing URLs.

## Goals

1. Make a first-time technical leader understand within one viewport that Nick Nisi works at the intersection of AI adoption, developer experience, and engineering practice.
2. Make exploring workshops the homepage’s primary next step while keeping writing, speaking, projects, and community work visible as authority evidence.
3. Create a Nick-centered workshops page that accurately explains his role in the shared Claude workshop collaboration and routes qualified visitors to the verified shared booking destination.
4. Replace the shared visual system and perception-shaping routes with one responsive, accessible, unmistakably Nick design selected and executed through the Impeccable workflow.
5. Preserve the existing Astro content archive, public URLs, and long-form readability while updating stale positioning and metadata.

## Success Criteria

- [ ] The project typechecks after the redesign. — check: `pnpm run typecheck` → exits 0
- [ ] The production site builds after the redesign. — check: `pnpm run build` → exits 0
- [ ] The production build includes the redesigned homepage, workshops page, about page, speaking page, writing index, and a representative article. — check: `test -f dist/index.html && test -f dist/workshops/index.html && test -f dist/about/index.html && test -f dist/speaking/index.html && test -f dist/posts/index.html && test -f dist/posts/ai-tooling/index.html` → exits 0
- [ ] The homepage and workshops page expose stable structural markers for their primary jobs rather than relying on copy-sensitive verification. — check: `grep -q 'data-surface="homepage-authority"' dist/index.html && grep -q 'data-surface="workshops"' dist/workshops/index.html` → exits 0
- [ ] The legacy AI engineering route continues to resolve to the new workshop destination. — check: `grep -q "'/ai-engineering': '/workshops'" astro.config.ts` → exits 0
- [ ] A five-second review communicates Nick’s name, AI-native DX focus, credible evidence, and the workshops path without requiring scrolling. — judgment call: Nick reviews the desktop and mobile first viewports and can identify all four elements within five seconds.
- [ ] The visual system feels specifically authored for Nick rather than like a generic AI/SaaS portfolio or a visual imitation of Zack Proser’s site. — judgment call: Nick compares the final desktop and mobile screenshots against the approved Impeccable direction and the Zack reference, confirming distinct authorship.
- [ ] Light and dark themes remain readable and intentional across the homepage, workshops page, article index, and representative article at desktop and mobile widths. — judgment call: The Impeccable finish review inspects paired light/dark desktop/mobile screenshots and reports no unresolved material contrast, hierarchy, overflow, or theme-inversion defects.
- [ ] The workshops page makes only source-backed claims about Nick, the crew, workshop format, and booking path. — judgment call: Nick verifies the page against the existing site content and Zack Proser workshop source before approval; no invented clients, outcomes, pricing, availability, or testimonials remain.

## Scope Boundaries

### In Scope

- Durable product record and Impeccable visual-direction process — The redesign needs confirmed product truth and an approved visual world before implementation; competitor imitation or another arbitrary reskin would repeat the current problem.
- Shared visual foundation and global chrome — Typography, color, spacing, surfaces, navigation, footer, theme behavior, focus states, and responsive rules must establish one coherent system across the archive.
- Authority-led homepage — The homepage is the main perception problem and must establish AI-native DX authority, proof, and workshops as the primary action.
- Nick-centered workshops page — Nick needs a durable home for his role in the shared workshop offer and a clear route to the verified booking flow.
- Preserved archive and legacy route continuity — The redesign cannot break existing article URLs or the current AI engineering entry point.
- About page and reusable press-kit repositioning — Bios and personal context must align with current AI-native DX leadership while keeping past podcast and wedding details appropriately secondary.
- Speaking page and core content indexes — These routes provide the strongest supporting evidence and should inherit the new hierarchy rather than read as disconnected archives.
- Shared long-form article layout — Articles are major entry points and need the new typography, navigation, themes, and authority context without rewriting individual posts.
- Metadata, descriptions, navigation, and social-preview positioning — Search and shared links must communicate the same current identity as the rendered pages.
- Typed Void redirect destination update — Typed Void should remain the legal/business vehicle and send visitors to Nick’s canonical workshop destination rather than maintain a competing public brand.
- Selective motion or signature interaction from the approved Impeccable direction — A memorable interaction can strengthen authorship only after clarity, accessibility, responsiveness, and performance are proven.
- Additional recent workshop and conference media curation — Existing assets may support richer proof, but only verified, high-quality media that improves the narrative should be added.

### Out of Scope

- Rewriting the historical article archive — The archive is evidence and should inherit the new system; individual editorial rewrites do not serve the positioning goal.
- Individually redesigning every experiment, utility, résumé, and specialty route — Core-system inheritance is sufficient; bespoke work on every route would expand cost without improving the primary audience journey.
- A separate Typed Void visual identity or full website — Nick is the public brand; maintaining two full brand systems would split attention and credibility.
- A visual clone of Zack Proser’s site — His hierarchy and proof strategy are useful references, but the result must be unmistakably Nick and use an independently chosen Impeccable direction.
- A CMS, newsletter platform, analytics program, or lead-management system — None is required to solve the current positioning and design problem.
- Invented testimonials, clients, outcomes, prices, availability, or performance claims — Commercial credibility must come from verified evidence, not placeholder social proof.

### Future Considerations

- Measure workshop-path usage after launch and decide whether a newsletter or broader work-with-me funnel earns prominence.
- Revisit specialty routes only when traffic or content importance justifies bespoke treatment.
- Add case studies when verified client or workshop outcomes are available and approved for publication.

## Decisions Considered and Rejected

- **Use nicknisi.com as the canonical public brand and keep Typed Void LLC as the legal/business vehicle.** — rejected: Maintain and redesign separate Nick Nisi and Typed Void public brands.. Clients hire Nick’s reputation and expertise; two public brands would split maintenance, SEO, and credibility.
- **Establish authority before selling.** — rejected: Turn the homepage into a workshop-first sales funnel.. The site must remain a durable personal authority hub whose commercial path is credible because of the work around it.
- **Position Nick around AI-native developer experience for technical leaders.** — rejected: Lead with generic AI expertise, developer tooling alone, or technical education alone.. AI-native DX connects Nick’s current leadership, engineering systems, tooling history, and teaching without erasing the foundation that differentiates him.
- **Create a Nick-centered workshops page with a shared booking handoff.** — rejected: Only link to Zack’s page or duplicate its complete sales page.. Nick needs durable ownership of his role and evidence without creating two competing canonical descriptions of the offer.
- **Redesign the core system and perception-shaping pages.** — rejected: Redesign every generated route or limit work to homepage styling.. This changes the visitor’s perception coherently while preserving the archive and avoiding another expensive whole-site churn.
- **Use Impeccable to select and execute the visual world.** — rejected: Copy Zack Proser’s visual identity or silently continue the incumbent zine system.. The result must meet a high craft bar and feel specifically authored for Nick rather than competitor-derived or merely polished.

## Execution Plan

_Added during Phase 5 handoff. Pick up this contract cold and know exactly how to execute._

### Dependency Graph

```
Visual Direction and System
  └── Authority and Workshops Journey  (blocked by Visual Direction and System)
        └── Evidence Surfaces and Archive Integration  (blocked by Authority and Workshops Journey)
              └── Impeccable Finish Review  (blocked by Evidence Surfaces and Archive Integration)
```

### Execution Steps

**Run the project** (recommended) — autopilot reads this contract, plans dependency waves, runs independent phases in parallel, and gates on failure:

```bash
/ideation:autopilot docs/ideation/ai-native-dx-personal-site/contract.md
```

**Or run it unattended** — a `/goal` is a durability wrapper around the same autopilot run: Claude re-checks the condition before it is allowed to stop, so failures get repaired and re-run. Generated by `contract-gen --print-goal`; this is the only copy of that string:

```
/goal Drive the AI-Native DX Personal Site contract (ai-native-dx-personal-site) to completion with /ideation:autopilot.

1. Run `/ideation:autopilot docs/ideation/ai-native-dx-personal-site/contract.md`. All commits belong on branch ideation/ai-native-dx-personal-site — switch to it before any run.
2. It dispatches a BACKGROUND workflow. Wait for the completion notification — never start a second autopilot run while one is in flight.
3. Then run the ideation plugin's `scripts/verify.mjs` against `docs/ideation/ai-native-dx-personal-site/contract-data.json` and leave its VERIFY line in the conversation. Resolve the plugin's install directory first — `${CLAUDE_PLUGIN_ROOT}/scripts/verify.mjs` is a placeholder, not a shell variable, and bash will not expand it. That line is the only evidence this goal is judged on.
4. If anything failed, fix the spec or the implementation and go back to step 1. Autopilot skips phases that already have commits.

Done when the most recent VERIFY line reads fail=0 and commits=4/4 — or when two consecutive VERIFY lines are identical and still failing, in which case name the failing checks and stop, because a contract whose checks have rotted must not trap the run.
```

**Or run phases manually** in dependency order:

**Strategy**: Sequential design lock followed by coordinated implementation and bounded finish review

1. **Phase 1** — Visual Direction and System _(blocking)_

   ```bash
   /ideation:execute-spec docs/ideation/ai-native-dx-personal-site/spec-phase-1.md
   ```

2. **Phase 2** — Authority and Workshops Journey _(blocking)_

   ```bash
   /ideation:execute-spec docs/ideation/ai-native-dx-personal-site/spec-phase-2.md
   ```

3. **Phase 3** — Evidence Surfaces and Archive Integration _(blocking)_

   ```bash
   /ideation:execute-spec docs/ideation/ai-native-dx-personal-site/spec-phase-3.md
   ```

4. **Phase 4** — Impeccable Finish Review _(blocking)_

   ```bash
   /ideation:execute-spec docs/ideation/ai-native-dx-personal-site/spec-phase-4.md
   ```

---

_This contract was generated from brain dump input. Review and approve before proceeding to specification._
