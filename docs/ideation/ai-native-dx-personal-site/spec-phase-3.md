# Implementation Spec: AI-Native DX Personal Site - Phase 3

**Contract**: ./contract.md
**Estimated Effort**: L

## Technical Approach

Apply the approved visual system and positioning to the evidence surfaces that make the homepage’s authority claim credible: About/press kit, Speaking, content indexes, and the shared article layout. Preserve content collections and historical posts. Update current bios and route-level framing, not the substance of old articles.

Use shared layouts/components where the same information architecture genuinely repeats. Do not bespoke-redesign every specialty route. Their inherited header, footer, typography, colors, focus behavior, and theme handling are sufficient unless a core-system change breaks them.

Update metadata and navigation so search results, social shares, and direct-entry article visitors encounter the same current identity. Coordinate the Typed Void repository separately: its public domains should redirect to the canonical Nick workshops destination, but do not copy design or content back into that site.

## Decisions Considered and Rejected

- **Redesign the core system and perception-shaping pages** — rejected: every generated route or homepage-only styling. This yields coherence without expensive archive churn.
- **Use nicknisi.com as the canonical public brand** — rejected: a separate Typed Void public identity. Typed Void remains legal/business attribution and redirects to Nick’s workshop destination.
- **Establish authority before selling** — rejected: converting every page into a workshop funnel. Evidence routes must remain useful in their own right.
- **Position around AI-native DX** — rejected: erase the TypeScript, tooling, speaking, streaming, and community history. Those are the foundation that differentiates Nick’s current work.

## Feedback Strategy

**Inner-loop command**: `pnpm run typecheck`

**Playground**: Astro dev server with `/about`, `/speaking`, `/posts`, one representative MDX article, and the social metadata routes.

**Why this approach**: Shared layout and content edits are best checked through representative routes, while typecheck catches collection and Astro template errors quickly.

## File Changes

### New Files

No required new source file. Add a small shared component only when two or more target routes need identical semantic structure and existing components cannot express it.

### Modified Files

| File Path | Changes |
| --- | --- |
| `src/pages/about.astro` | Reframe biography and press-kit copy around current AI-native DX leadership; keep personal/past details secondary and accurate. |
| `src/pages/speaking/index.astro` | Lead with current workshop/talk authority and remove prominent wedding-officiating callout. |
| `src/pages/speaking/all.astro` | Apply the approved index hierarchy and system. |
| `src/pages/posts/index.astro` | Improve content discovery and current-topic authority without rewriting posts. |
| `src/layouts/Markdown.astro` | Apply the approved long-form reading system, article context, and theme behavior. |
| `src/layouts/Page.astro` | Align generic core pages with the approved system if needed. |
| `src/layouts/Base.astro` | Support route metadata or structural changes shared by evidence surfaces. |
| `src/components/cards/Post.astro` | Restyle article cards/list items in the approved grammar. |
| `src/components/sections/Posts.astro` | Support useful curated/index presentation without speculative API design. |
| `src/components/sections/Appearances.astro` | Present speaking/workshop evidence in the approved grammar. |
| `src/components/cards/Appearance.astro` | Restyle appearance entries and strengthen accessible metadata. |
| `src/components/sections/Projects.astro` and `src/components/cards/Project.astro` | Align selected project evidence if these remain on About/home. |
| `src/data/metadata.json` | Replace stale description/venture/training/podcast framing with current source-of-truth data. |
| `src/components/Head.astro` | Ensure title, description, canonical, social image, and theme metadata use the current positioning. |
| `src/pages/og-image.png.ts` and related OG helpers | Update default social-preview positioning within the approved visual system. |
| `public/_redirects` only if needed | Preserve historical utility redirects; do not remove unrelated podcast shortcuts solely because shows are no longer current. |

### Cross-Repository Change

| Repository / File | Changes |
| --- | --- |
| `/Users/nicknisi/Developer/typedvoid.com/public/_redirects` or its actual redirect configuration | Redirect `typedvoid.com` and `www.typedvoid.com` traffic to `https://nicknisi.com/workshops` using the deployment platform’s supported permanent redirect. Inspect that repository before choosing the exact file. |

### Deleted Files

Delete no historical content. Remove an obsolete source file only when its route is replaced by an explicit redirect and no import remains.

## Implementation Details

### About and Press Kit

**Pattern to follow**: `src/pages/about.astro`

**Overview**: Make the reusable bios accurate for current introductions while retaining the history that makes Nick credible.

**Implementation steps**:

1. Update hero and opening biography to current AI-native DX leadership and hands-on systems work.
2. Present WorkOS role claims conservatively and consistently with the verified workshop source and Nick’s own confirmation.
3. Keep TypeScript advocacy, conference organization, community work, prior JS Party hosting, and weekly streaming as supporting history.
4. Remove wedding count from the hero and primary biography. Keep at most one small personal/easter-egg mention if it fits the approved composition.
5. Rewrite first- and third-person press-kit bios so event organizers can copy accurate current language.
6. Preserve direct links to résumé, speaking, selected projects, and social profiles.

**Feedback loop**:

- **Playground**: `/about` at desktop/mobile widths.
- **Experiment**: Read only the hero and each copyable bio; verify each independently communicates current role, AI-native DX focus, teaching/speaking evidence, and no stale current podcast claim.
- **Check command**: `pnpm run typecheck`

### Speaking and Workshop Evidence

**Pattern to follow**: `src/pages/speaking/index.astro`, `src/content/data/speaking.json`

**Overview**: Make current teaching and AI/tooling talks discoverable without falsifying historical appearance data.

**Implementation steps**:

1. Rewrite the speaking introduction around technical talks, hands-on workshops, panels, and hosting.
2. Remove the prominent officiating-weddings Callout; personal detail may survive only as a quiet easter egg elsewhere.
3. Curate or promote verified recent AI/workshop appearances using existing data and assets.
4. Keep the complete historical index and direct talk routes intact.
5. Give event organizers a clear inquiry path that does not compete with Workshops on unrelated pages.

**Feedback loop**:

- **Playground**: `/speaking` and `/speaking/all`.
- **Experiment**: Test with promoted data present and absent; confirm list semantics, dates, titles, and links remain useful.
- **Check command**: `pnpm run typecheck`

### Writing Index and Long-Form Layout

**Pattern to follow**: `src/pages/posts/index.astro`, `src/layouts/Markdown.astro`, `src/components/cards/Post.astro`

**Overview**: Preserve the archive while making current AI/tooling work easier to discover and every article more readable.

**Implementation steps**:

1. Recompose the writing index around browsing/scanning, with recent or selected AI-native DX work visible without hiding chronology or tags.
2. Apply the approved card/list grammar with strong titles, dates, tags, and focus states.
3. Rebuild the Markdown reading shell with deliberate measure, typography, code, media, blockquote, footnote, and navigation behavior.
4. Give direct-entry article readers subtle current-author context and routes to related work; do not inject a heavy workshop banner into every article.
5. Preserve MDX component behavior and expressive-code themes.

**Feedback loop**:

- **Playground**: `/posts`, `/posts/ai-tooling`, and one older MD/MDX article with code/media.
- **Experiment**: Test narrow/wide viewports, long titles, code overflow, missing hero image, blockquotes, embeds, and both themes.
- **Check command**: `pnpm run typecheck`

### Metadata and Social Preview

**Pattern to follow**: `src/components/Head.astro`, `src/pages/og-image.png.ts`, `src/data/metadata.json`

**Overview**: Align external representations with the redesigned site.

**Implementation steps**:

1. Update site description to AI-native DX authority without keyword stuffing.
2. Ensure homepage, workshops, about, speaking, posts, and articles emit distinct accurate titles/descriptions/canonicals.
3. Update the default OG image to the approved system and current positioning.
4. Keep generated OG routes functional and readable.
5. Remove stale active podcast metadata while retaining historical content/redirects that still serve old links.

### Typed Void Permanent Redirect

**Pattern to follow**: Inspect `/Users/nicknisi/Developer/typedvoid.com` deployment and redirect files before editing.

**Overview**: Consolidate public traffic on Nick’s canonical workshop page while retaining the domain and legal entity.

**Implementation steps**:

1. Confirm Cloudflare Pages/static redirect mechanism in the Typed Void repository.
2. Add a permanent wildcard redirect from Typed Void root/subpaths to `https://nicknisi.com/workshops`, unless a legal or required endpoint must remain.
3. Build the Typed Void site and inspect emitted redirect configuration.
4. Do not delete the repository or domain configuration.

**Feedback loop**:

- **Playground**: Typed Void local build output and redirect configuration.
- **Experiment**: Verify root, `www`, and an arbitrary path resolve to the intended canonical destination under the platform’s syntax.
- **Check command**: `pnpm run build`

## Testing Requirements

### Manual Testing

- [ ] About and both press-kit bios accurately describe Nick today.
- [ ] Wedding officiating is absent from prominent surfaces.
- [ ] Prior podcasts are clearly historical, not current.
- [ ] Weekly streaming is supporting evidence, not the primary identity.
- [ ] Speaking and writing indexes remain complete and navigable.
- [ ] Representative old and new articles are readable in both themes at desktop/mobile widths.
- [ ] Social previews and page metadata match current positioning.
- [ ] Typed Void root, www, and deep paths redirect to `https://nicknisi.com/workshops` after deployment verification.

## Failure Modes

| Component | Failure Mode | Trigger | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| About copy | Current-role overstatement | Third-party workshop copy is copied without Nick verification | Inaccurate professional bio | Use conservative language and Nick judgment criterion. |
| Historical content | Past work is erased | Repositioning removes JS/TypeScript/community history | Authority feels invented and archive loses context | Keep history as supporting evidence and label past commitments accurately. |
| Article layout | Direct-entry readers see a sales page | Workshop CTA is injected too aggressively | Reading experience and trust decline | Use subtle current-author context; keep persuasion on homepage/workshops. |
| Prose themes | Dark theme contrast regresses | Typography plugin overrides token styles | Articles become illegible | Preserve cascade-aware prose rules and inspect complex article states. |
| Metadata | One global description replaces route truth | Head refactor ignores page-level props | Search/social previews become generic | Preserve route-specific metadata API and test representative output. |
| Typed Void | Redirect loop or path loss | Destination or platform syntax is wrong | Traffic fails | Inspect platform config, build output, and deployed root/deep path before closing. |

## Validation Commands

```bash
pnpm run typecheck
pnpm run build
test -f dist/about/index.html
test -f dist/speaking/index.html
test -f dist/posts/index.html
test -f dist/posts/ai-tooling/index.html
```

Run separately in `/Users/nicknisi/Developer/typedvoid.com` after inspecting its package scripts:

```bash
pnpm run build
```

## Rollout Considerations

- **Feature flag**: None.
- **Monitoring**: Check deploy previews, existing inbound routes, canonical tags, and redirect behavior before production promotion.
- **Rollback plan**: Revert the phase commit in nicknisi.com; revert the Typed Void redirect commit independently if cross-domain behavior is wrong.

## Open Items

None. Preserve any still-useful historical redirect even when the linked activity is no longer current.

---

_This spec is ready for implementation. Follow the patterns and validate at each step._
