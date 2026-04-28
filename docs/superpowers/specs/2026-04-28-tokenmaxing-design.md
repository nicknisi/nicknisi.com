# `/tokenmaxing` Design

**Status:** Draft
**Date:** 2026-04-28
**Owner:** Nick Nisi

## 1. Goal

A weekly-updated `/tokenmaxing` page on nicknisi.com that publishes:

- Aggregate token + cost usage across the user's three coding agents (Claude Code, Pi, Codex), broken down by tool, provider, model, and project.
- A historical activity heatmap (per-day, all-time) similar to the reference screenshot in the brief.
- A list of public-repo pull requests authored each week, sorted by size.

Data is generated locally on the user's machine, published to a public GitHub Gist, fetched at build time by the static Astro site, and rendered on a single page.

## 2. Architecture

Two repositories:

```
┌──────────────────────────────────────────────────────────────────┐
│ ~/Developer/tokenmaxing/  (new, private repo recommended)        │
│                                                                  │
│   Bun + TypeScript                                               │
│   - parses ~/.claude/projects/**/*.jsonl                         │
│   - parses ~/.codex/sessions/**/*.jsonl                          │
│   - parses ~/.pi/agent/sessions/**/*.jsonl                       │
│   - fetches GitHub PRs via gh CLI                                │
│   - aggregates → tokenmaxing.json                                │
│   - publishes via `gh gist edit`                                 │
│   - calls Cloudflare Pages deploy hook                           │
└──────────────────────────────────────────────────────────────────┘
                          │ writes
                          ▼
              ┌─────────────────────────┐
              │  Public GitHub Gist     │
              │  tokenmaxing.json       │
              └─────────────────────────┘
                          │ fetches at build
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│ ~/Developer/nicknisi.com/  (existing public repo)                │
│                                                                  │
│   src/loaders/tokenmaxing.ts        (Astro remote loader)        │
│   src/content/config.ts             (collection definition)      │
│   src/pages/tokenmaxing.astro       (page)                       │
│   src/components/tokenmaxing/*      (page components)            │
└──────────────────────────────────────────────────────────────────┘
```

The two repos communicate solely through the public gist's data contract (Section 4).

## 3. Repos & Responsibilities

### 3.1 `tokenmaxing` (new repo)

**Owns:** parsing local agent logs, fetching public PR data, aggregation, publishing.

**Stack:** Bun + TypeScript. Single binary entry point (`src/index.ts`), invoked as `bun run start` or `tokenmaxing` (via `bin` entry in `package.json`).

**Privacy posture:** Recommended **private** repo. The code itself contains no secrets, but the local config + the user's data lives nearby. Source code is not interesting enough to require public visibility; private avoids any accidental future leakage.

### 3.2 `nicknisi.com` (existing public repo)

**Owns:** fetching the gist at build time, validating shape, rendering the page.

**Stack:** Astro 5 (existing), React islands for interactive bits, Tailwind 4 (existing).

## 4. Data Contract (the gist)

Single JSON file, single top-level object. Versioned via a `schemaVersion` field for future migration.

```jsonc
{
  "schemaVersion": 1,
  "generatedAt": "2026-04-28T13:00:00.000Z",
  "period": { "from": "2024-12-01", "to": "2026-04-28" },

  "summary": {
    "totalCostUSD": 1234.56,
    "totalTokens": 76500000,
    "sessions": 2548,
    "messages": 358900,
    "activeDays": 112,
    "currentStreakDays": 3,
    "longestStreakDays": 34,
    "peakHourLocal": 11,
    "favoriteModel": {
      "tool": "claude-code",
      "provider": "anthropic",
      "id": "claude-opus-4-7",
      "label": "Opus 4.7"
    }
  },

  "byTool": [
    {
      "id": "claude-code",
      "label": "Claude Code",
      "tokens": 71800000,
      "costUSD": 980.12,
      "sessions": 2326,
      "messages": 354296
    }
    // ...one entry per tool present in the data
  ],

  "byProvider": [
    {
      "id": "anthropic",
      "label": "Anthropic",
      "tokens": 73000000,
      "costUSD": 1050.30
    }
  ],

  "byModel": [
    {
      "tool": "claude-code",
      "provider": "anthropic",
      "id": "claude-opus-4-7",
      "label": "Opus 4.7",
      "tokens": 50000000,
      "costUSD": 800.00,
      "sessions": 1500,
      "messages": 220000
    }
  ],

  "byProject": [
    {
      "label": "dotfiles",       // basename of cwd, redacted (no full path)
      "tokens": 8400000,
      "costUSD": 110.20,
      "sessions": 240
    }
  ],

  "daily": [
    {
      "date": "2026-04-28",       // local date (America/Chicago)
      "tokens": 1234567,
      "costUSD": 12.34,
      "sessions": 5,
      "messages": 234,
      "byTool": {
        "claude-code": { "tokens": 1000000, "costUSD": 10.00 },
        "pi":          { "tokens":  234567, "costUSD":  2.34 }
      }
    }
  ],

  "weeklyHighlights": [
    {
      "weekEnding": "2026-04-27",  // local Sunday (America/Chicago)
      "pullRequests": [
        {
          "url": "https://github.com/owner/repo/pull/123",
          "repo": "owner/repo",
          "number": 123,
          "title": "Add foo",
          "state": "merged",        // "open" | "merged" | "closed"
          "additions": 340,
          "deletions": 122,
          "createdAt": "2026-04-22T14:11:00.000Z",
          "mergedAt":  "2026-04-25T09:02:00.000Z"
        }
      ]
    }
  ]
}
```

### 4.1 Shape conventions

- **Top-level breakdowns** (`byTool`, `byProvider`, `byModel`, `byProject`) are arrays of objects — preserves deterministic sort order for rendering.
- **Per-day breakdown** (`daily[i].byTool`) is an object keyed by tool id — compact O(1) lookup at render time without re-sorting.

### 4.2 Invariants

- All arrays are sorted deterministically: `byTool` / `byProvider` / `byModel` by `costUSD desc`; `byProject` by `costUSD desc`; `daily` by `date asc`; `weeklyHighlights` by `weekEnding desc`; `pullRequests` within a week by `additions + deletions desc`.
- All money values are `number` USD with 2 decimal places after rounding.
- All token counts are integers.
- All timestamps are ISO 8601 in UTC; all `date` fields are local (America/Chicago) `YYYY-MM-DD`.
- Re-running the generator over the same inputs produces a byte-identical file (given a fixed `generatedAt` injection in tests).

## 5. Generator Project

### 5.1 Layout

```
~/Developer/tokenmaxing/
  package.json
  tsconfig.json
  bun.lock
  src/
    index.ts                 # CLI entry
    parsers/
      claude-code.ts
      codex.ts
      pi.ts
    pricing.ts               # model → $ per 1M tokens table (checked in)
    github.ts                # gh CLI invocations for PR data
    aggregate.ts             # builds final shape from parsed sessions
    publish.ts               # writes to gist, hits deploy hook
    config.ts                # reads ~/.config/tokenmaxing/{.env, exclude.json}
    types.ts                 # shared types matching data contract
  test/
    fixtures/                # sample session jsonl files
    parsers.test.ts
    aggregate.test.ts
  README.md
```

### 5.2 Inputs

| Source | Path | Notes |
|---|---|---|
| Claude Code | `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` | Tokens only; cost computed from `pricing.ts`. |
| Pi | `~/.pi/agent/sessions/<encoded-cwd>/<timestamp>_<id>.jsonl` | Pre-computes cost per message in `usage.cost.total`. Trust it. |
| Codex | `~/.codex/sessions/**/*.jsonl` | Path verified on first run; if dir missing, parser returns empty. Tokens only; cost computed from `pricing.ts`. |
| GitHub PRs | `gh search prs --author=<user> --created=<from>..<to> --json url,repository,number,title,state,createdAt,mergedAt,additions,deletions` | Paged in week-sized windows back to oldest local data. |

### 5.3 Pricing Table

`src/pricing.ts` exports a per-model price table:

```ts
export const PRICING: Record<string, { inputUSDPer1M: number; outputUSDPer1M: number; cacheReadUSDPer1M?: number; cacheWriteUSDPer1M?: number }> = {
  "claude-opus-4-7":    { inputUSDPer1M: 15, outputUSDPer1M: 75, cacheReadUSDPer1M: 1.50, cacheWriteUSDPer1M: 18.75 },
  // ...
};
```

Checked into the repo. Updated when new models ship. Unknown model id → cost contribution is 0 + a console warning (does not crash; flagged in run summary). The example above shows one entry; the actual table maintained in code covers every model the user has run across all three tools.

### 5.4 Aggregation rules

- **Day boundary:** `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' })` → `YYYY-MM-DD`.
- **Week boundary:** ISO week ending on Sunday in `America/Chicago`. PRs assigned to the week containing their `mergedAt` (or `createdAt` if not merged).
- **Streak:** `activeDay` = any day with ≥1 session across any tool. `currentStreakDays` = length of contiguous active-day run ending on today's local date; if today is inactive, current streak is `0`. `longestStreakDays` = max contiguous active-day run anywhere in the period.
- **Peak hour:** UTC `timestamp` → local hour (America/Chicago); mode across all messages. Ties broken by lowest hour value.
- **Favorite model:** `byModel` entry with max `messages`.

### 5.5 Configuration

Read from `~/.config/tokenmaxing/.env`:

```
GIST_ID=...                          # required
CLOUDFLARE_DEPLOY_HOOK_URL=...       # required
GITHUB_USER=nicknisi                 # required
TIMEZONE=America/Chicago             # default if absent
```

Read from `~/.config/tokenmaxing/exclude.json` (optional):

```jsonc
{
  "projectBasenames": ["client-acme-secret-project"]
}
```

Excluded projects are dropped from `byProject` *and* their tokens are subtracted from totals (a fully excluded project is invisible). Logged at run time so accidental exclusions are visible.

### 5.6 CLI

```
tokenmaxing build              # parse + aggregate, write ./out/tokenmaxing.json (no publish)
tokenmaxing publish            # build + publish to gist + call deploy hook
tokenmaxing dry-run            # build + diff against current gist content; no write
tokenmaxing list-projects      # dump basenames seen in inputs (for exclude.json review)
```

Default exit code 0 on success; non-zero on any unrecoverable error (missing config, gh auth failure, deploy hook 5xx).

### 5.7 Tests

- Parser tests use checked-in fixture jsonl files (one per tool, ~10 messages each) and assert tokens/cost match expected values.
- Aggregation tests inject deterministic dates and verify sort orders, streak math, week boundaries.
- No network in tests. `github.ts` and `publish.ts` covered by integration-style smoke tests run manually.

## 6. Consumer (nicknisi.com)

### 6.1 Loader

`src/loaders/tokenmaxing.ts` mirrors the structure of `src/loaders/bsky.ts`:

```ts
import type { Loader } from 'astro/loaders';

export const tokenmaxingLoader = ({ gistId }: { gistId: string }): Loader => ({
  name: 'tokenmaxing',
  async load({ store, logger, parseData }) {
    try {
      const url = `https://gist.githubusercontent.com/nicknisi/${gistId}/raw/tokenmaxing.json`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`gist fetch ${res.status}`);
      const data = await res.json();
      store.set({ id: 'current', data: await parseData({ id: 'current', data }) });
    } catch (err) {
      logger.error(`tokenmaxing loader: ${(err as Error).message}`);
      // Fall through with no data; page handles empty state.
    }
  },
});
```

`<user>` and `gistId` come from `import.meta.env.TOKENMAXING_GIST_ID` (set in Cloudflare Pages env vars).

### 6.2 Collection

Add to `src/content/config.ts`:

```ts
const tokenmaxing = defineCollection({
  loader: tokenmaxingLoader({ gistId: import.meta.env.TOKENMAXING_GIST_ID }),
  schema: z.object({
    schemaVersion: z.literal(1),
    generatedAt: z.string().datetime(),
    period: z.object({ from: z.string().date(), to: z.string().date() }),
    summary: z.object({ /* ... full shape from §4 */ }),
    // ...
  }),
});
```

Schema is the validation boundary. If the gist is malformed, build still succeeds; page renders empty state.

### 6.3 Page

`src/pages/tokenmaxing.astro` — single static page.

**Layout (top to bottom):**

1. **Page header:** title "Tokenmaxing", subtitle with `period` range and "Last updated `generatedAt`".
2. **Stale-data badge:** if `generatedAt` is >14 days old, render a yellow "Data may be stale" pill next to the subtitle.
3. **Stats grid (8–9 tiles):** Sessions, Messages, Total tokens, Total cost, Active days, Current streak, Longest streak, Peak hour, Favorite model.
4. **Time range toggle:** `All` | `30d` | `7d`. Drives the heatmap and per-period totals via client-side recompute over `daily`.
5. **View tabs:** `Overview` | `By Tool` | `By Provider` | `By Model` | `By Project`. Switches the rendered breakdown table.
6. **Activity heatmap:** grid of squares (one per day in `daily`), colored by `tokens` (or `costUSD` toggled). Hover shows date + count.
7. **Weekly highlights section:** chronological from `weeklyHighlights`. Each week: header "Week of YYYY-MM-DD"; PR list — one row each: `[merged]` repo#number — title (additions↑ deletions↓ link out).
8. **Footer line:** "You've used ~Nx more tokens than Moby-Dick." (≈215 000 tokens; see §6.4.)

**Empty state:** if loader stored no data, render a placeholder with the explanatory note "Data feed offline — refreshes weekly."

**Interactivity:** time-range toggle, view-tab switch, and heatmap metric toggle live in a single React island (`src/components/tokenmaxing/Dashboard.tsx`). Everything else is static Astro components.

### 6.4 Moby-Dick reference

`MOBY_DICK_TOKENS = 215000` (constant). Comparison is `Math.round(summary.totalTokens / MOBY_DICK_TOKENS)`.

## 7. Update Flow

1. User triggers (manually, via `cron`, or via Claude scheduled task) `tokenmaxing publish` on the local machine.
2. Generator parses local logs, fetches PRs, builds JSON, writes to gist via `gh gist edit`.
3. Generator POSTs to `CLOUDFLARE_DEPLOY_HOOK_URL` to trigger a Pages rebuild.
4. Cloudflare builds nicknisi.com; Astro loader fetches the (now updated) gist; static page is regenerated with new data.

Failure modes:
- gist write succeeds but deploy hook fails → next manual rebuild picks up the data; data is current in the gist.
- gist write fails → exit non-zero; nothing changes; user re-runs.
- deploy hook succeeds but gist write was a no-op → site rebuilds with unchanged data; harmless.

## 8. Privacy & Secrets

- **Secrets never in either repo.** Deploy hook URL and gist ID live in `~/.config/tokenmaxing/.env` (local) and Cloudflare Pages env vars (build).
- **Project paths redacted to basenames** in `byProject`. Optional `exclude.json` for sensitive basenames.
- **Session content never leaves the local machine.** Only aggregate counts/costs and PR metadata (already public on GitHub) get published.
- **First-run review:** initial `tokenmaxing list-projects` dump → user adds anything sensitive to `exclude.json` → `publish`.

## 9. Out of Scope

- Live/runtime data (page is rebuilt weekly; not real-time).
- Direct (non-PR) commits to default branches.
- Private-repo activity (PR query is public-default; private PRs require auth scope and are excluded by design).
- LLM-generated prose summaries of work shipped (avoids hallucination on a public site).
- Multi-machine aggregation (single laptop's `~/.claude`, `~/.pi`, `~/.codex` are the source of truth).
- Drill-down per-PR diff stats beyond `additions` / `deletions`.

## 10. Open Questions

- Confirm `~/.codex/sessions/` is the correct path on first parser run; adjust if not.
- Confirm Anthropic / OpenAI / Baseten model pricing values used in `pricing.ts` against current published prices on first build.
