# Tokenmaxing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/tokenmaxing` page on nicknisi.com that publishes weekly aggregated AI-coding-agent usage data (Claude Code, Pi, Codex) plus public-repo PR activity, fed by a separate Bun generator that publishes to a public GitHub Gist.

**Architecture:** Two repos. New `~/Developer/tokenmaxing/` (Bun + TypeScript) parses local agent session jsonl files, fetches PR data via `gh`, aggregates, publishes JSON to a public gist, and triggers a Cloudflare Pages rebuild. Existing `~/Developer/nicknisi.com/` (Astro 5) adds a remote loader that fetches the gist at build time and a static `/tokenmaxing` page that renders the dashboard.

**Tech Stack:** Bun, TypeScript, Astro 5, React 19, Tailwind 4, gh CLI, GitHub Gists, Cloudflare Pages.

**Spec:** [`docs/superpowers/specs/2026-04-28-tokenmaxing-design.md`](../specs/2026-04-28-tokenmaxing-design.md)

---

## File Structure

### Generator repo: `~/Developer/tokenmaxing/`

```
package.json                     # Bun project, "type": "module", bin entry
tsconfig.json                    # strict, ESNext, bundler resolution
.gitignore                       # node_modules, out/, *.local
README.md                        # quick start
src/
  index.ts                       # CLI dispatcher (build|publish|dry-run|list-projects)
  types.ts                       # shared types matching the data contract
  pricing.ts                     # PRICING table + computeCost(model, usage)
  config.ts                      # readEnv() + readExclude() from ~/.config/tokenmaxing/
  github.ts                      # fetchPullRequests(user, from, to)
  aggregate.ts                   # aggregate(parsed[]) -> TokenmaxingData
  publish.ts                     # writeGist(id, json) + triggerDeploy(url)
  parsers/
    types.ts                     # UsageEvent (the unified intermediate)
    util.ts                      # walkJsonl(dir), localDate(ts, tz)
    claude-code.ts               # parseClaudeCode() -> UsageEvent[]
    pi.ts                        # parsePi() -> UsageEvent[]
    codex.ts                     # parseCodex() -> UsageEvent[]
test/
  fixtures/
    claude-code/sample.jsonl
    pi/sample.jsonl
    codex/sample.jsonl
  pricing.test.ts
  parsers.test.ts
  aggregate.test.ts
```

### Consumer repo: `~/Developer/nicknisi.com/` (existing, additions only)

```
src/
  loaders/
    tokenmaxing.ts               # fetches the gist, mirrors bsky.ts
  content/
    config.ts                    # MODIFY: add `tokenmaxing` collection
  pages/
    tokenmaxing.astro            # the page
  components/
    tokenmaxing/
      Dashboard.tsx              # React island: tabs/toggle/heatmap state
      StatsGrid.astro            # static top tiles
      WeeklyHighlights.astro     # static PR list per week
      StaleBadge.astro           # conditional "Data may be stale"
      MobyDickFooter.astro       # one-liner footer
```

### Local config (not in either repo)

```
~/.config/tokenmaxing/
  .env                           # GIST_ID, CLOUDFLARE_DEPLOY_HOOK_URL, GITHUB_USER
  exclude.json                   # { "projectBasenames": [] }
```

---

# Phase 1 — Generator (`~/Developer/tokenmaxing/`)

## Task 1: Bootstrap the Bun project

**Files:**
- Create: `~/Developer/tokenmaxing/package.json`
- Create: `~/Developer/tokenmaxing/tsconfig.json`
- Create: `~/Developer/tokenmaxing/.gitignore`
- Create: `~/Developer/tokenmaxing/README.md`
- Create: `~/Developer/tokenmaxing/src/types.ts`

- [ ] **Step 1: Create the directory and init git**

```bash
mkdir -p ~/Developer/tokenmaxing && cd ~/Developer/tokenmaxing && git init -b main
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "tokenmaxing",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "bin": { "tokenmaxing": "./src/index.ts" },
  "scripts": {
    "build": "bun run src/index.ts build",
    "publish": "bun run src/index.ts publish",
    "dry-run": "bun run src/index.ts dry-run",
    "list-projects": "bun run src/index.ts list-projects",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "types": ["bun"],
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
out/
*.local
.DS_Store
bun.lock
```

- [ ] **Step 5: Write `README.md`**

```markdown
# tokenmaxing

Generates the data feeding [nicknisi.com/tokenmaxing](https://nicknisi.com/tokenmaxing).

Parses local AI coding agent session logs (Claude Code, Pi, Codex), fetches public PR activity, aggregates, publishes to a public GitHub Gist, and triggers a Cloudflare Pages rebuild.

## Setup

1. Install Bun: https://bun.sh
2. Install gh CLI and authenticate: `gh auth login`
3. Create config:
   ```
   mkdir -p ~/.config/tokenmaxing
   $EDITOR ~/.config/tokenmaxing/.env
   ```
   Required keys:
   ```
   GIST_ID=...
   CLOUDFLARE_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...
   GITHUB_USER=nicknisi
   ```
4. (Optional) `~/.config/tokenmaxing/exclude.json`:
   ```json
   { "projectBasenames": ["client-codename"] }
   ```

## Commands

- `bun run build` — produce `out/tokenmaxing.json` (no publish)
- `bun run publish` — build + write to gist + trigger rebuild
- `bun run dry-run` — diff against current gist content
- `bun run list-projects` — list discovered project basenames
```

- [ ] **Step 6: Install Bun deps**

Run: `cd ~/Developer/tokenmaxing && bun install`
Expected: creates `bun.lock`, populates `node_modules/`. No errors.

- [ ] **Step 7: Write `src/types.ts`**

```ts
// Types match the public data contract in
// nicknisi.com/docs/superpowers/specs/2026-04-28-tokenmaxing-design.md §4

export type ToolId = 'claude-code' | 'pi' | 'codex';
export type ProviderId = 'anthropic' | 'openai' | 'baseten' | string;

export interface ModelRef {
  tool: ToolId;
  provider: ProviderId;
  id: string;
  label: string;
}

export interface ToolBreakdown {
  id: ToolId;
  label: string;
  tokens: number;
  costUSD: number;
  sessions: number;
  messages: number;
}

export interface ProviderBreakdown {
  id: ProviderId;
  label: string;
  tokens: number;
  costUSD: number;
}

export interface ModelBreakdown extends ModelRef {
  tokens: number;
  costUSD: number;
  sessions: number;
  messages: number;
}

export interface ProjectBreakdown {
  label: string;
  tokens: number;
  costUSD: number;
  sessions: number;
}

export interface DailyEntry {
  date: string;          // YYYY-MM-DD local
  tokens: number;
  costUSD: number;
  sessions: number;
  messages: number;
  byTool: Partial<Record<ToolId, { tokens: number; costUSD: number }>>;
}

export interface PullRequest {
  url: string;
  repo: string;
  number: number;
  title: string;
  state: 'open' | 'merged' | 'closed';
  additions: number;
  deletions: number;
  createdAt: string;     // ISO UTC
  mergedAt: string | null;
}

export interface WeeklyHighlight {
  weekEnding: string;    // YYYY-MM-DD local Sunday
  pullRequests: PullRequest[];
}

export interface TokenmaxingData {
  schemaVersion: 1;
  generatedAt: string;   // ISO UTC
  period: { from: string; to: string };
  summary: {
    totalCostUSD: number;
    totalTokens: number;
    sessions: number;
    messages: number;
    activeDays: number;
    currentStreakDays: number;
    longestStreakDays: number;
    peakHourLocal: number;
    favoriteModel: ModelRef;
  };
  byTool: ToolBreakdown[];
  byProvider: ProviderBreakdown[];
  byModel: ModelBreakdown[];
  byProject: ProjectBreakdown[];
  daily: DailyEntry[];
  weeklyHighlights: WeeklyHighlight[];
}
```

- [ ] **Step 8: Verify typecheck**

Run: `cd ~/Developer/tokenmaxing && bun run typecheck`
Expected: no output, exit 0.

- [ ] **Step 9: Commit**

```bash
cd ~/Developer/tokenmaxing && git add . && git commit -m "chore: bootstrap tokenmaxing project"
```

---

## Task 2: Pricing table + cost calculator (TDD)

**Files:**
- Create: `~/Developer/tokenmaxing/src/pricing.ts`
- Create: `~/Developer/tokenmaxing/test/pricing.test.ts`

- [ ] **Step 1: Write the failing test**

`~/Developer/tokenmaxing/test/pricing.test.ts`:

```ts
import { test, expect } from 'bun:test';
import { computeCost, getPricing } from '../src/pricing.ts';

test('computeCost: known model, all four token kinds', () => {
  const result = computeCost('claude-opus-4-7', {
    input: 1_000_000,
    output: 1_000_000,
    cacheRead: 1_000_000,
    cacheWrite: 1_000_000,
  });
  // Opus 4.7: in $15, out $75, cacheRead $1.50, cacheWrite $18.75 (per 1M)
  expect(result).toBeCloseTo(15 + 75 + 1.5 + 18.75, 4);
});

test('computeCost: unknown model returns 0', () => {
  const result = computeCost('not-a-real-model', {
    input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0,
  });
  expect(result).toBe(0);
});

test('getPricing: returns entry for known model', () => {
  expect(getPricing('claude-opus-4-7')).not.toBeUndefined();
});

test('getPricing: returns undefined for unknown', () => {
  expect(getPricing('nope')).toBeUndefined();
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd ~/Developer/tokenmaxing && bun test test/pricing.test.ts`
Expected: FAIL with "Cannot find module '../src/pricing.ts'".

- [ ] **Step 3: Write `src/pricing.ts`**

```ts
export interface ModelPricing {
  inputUSDPer1M: number;
  outputUSDPer1M: number;
  cacheReadUSDPer1M?: number;
  cacheWriteUSDPer1M?: number;
}

export interface UsageCounts {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

// Verify these against published prices on first publish.
// Update when new models ship; old entries can stay for historical accuracy.
export const PRICING: Record<string, ModelPricing> = {
  // Anthropic — Claude
  'claude-opus-4-7':   { inputUSDPer1M: 15,   outputUSDPer1M: 75,  cacheReadUSDPer1M: 1.50, cacheWriteUSDPer1M: 18.75 },
  'claude-opus-4-6':   { inputUSDPer1M: 15,   outputUSDPer1M: 75,  cacheReadUSDPer1M: 1.50, cacheWriteUSDPer1M: 18.75 },
  'claude-sonnet-4-6': { inputUSDPer1M: 3,    outputUSDPer1M: 15,  cacheReadUSDPer1M: 0.30, cacheWriteUSDPer1M: 3.75 },
  'claude-haiku-4-5':  { inputUSDPer1M: 1,    outputUSDPer1M: 5,   cacheReadUSDPer1M: 0.10, cacheWriteUSDPer1M: 1.25 },

  // OpenAI — Codex (GPT-5 family; verify before first publish)
  'gpt-5-5-codex':     { inputUSDPer1M: 5,    outputUSDPer1M: 15 },
  'gpt-5-codex':       { inputUSDPer1M: 5,    outputUSDPer1M: 15 },

  // Baseten — open-weight models routed via Pi
  'moonshotai/Kimi-K2.5': { inputUSDPer1M: 0.50, outputUSDPer1M: 2.00 },
};

export function getPricing(modelId: string): ModelPricing | undefined {
  return PRICING[modelId];
}

export function computeCost(modelId: string, usage: UsageCounts): number {
  const p = PRICING[modelId];
  if (!p) return 0;
  return (
    (usage.input       * p.inputUSDPer1M)            / 1_000_000 +
    (usage.output      * p.outputUSDPer1M)           / 1_000_000 +
    (usage.cacheRead   * (p.cacheReadUSDPer1M  ?? 0)) / 1_000_000 +
    (usage.cacheWrite  * (p.cacheWriteUSDPer1M ?? 0)) / 1_000_000
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `cd ~/Developer/tokenmaxing && bun test test/pricing.test.ts`
Expected: 4 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/pricing.ts test/pricing.test.ts && git commit -m "feat(pricing): model price table + cost calculator"
```

---

## Task 3: Parser shared types + utilities

**Files:**
- Create: `~/Developer/tokenmaxing/src/parsers/types.ts`
- Create: `~/Developer/tokenmaxing/src/parsers/util.ts`

- [ ] **Step 1: Write `src/parsers/types.ts`**

```ts
import type { ToolId, ProviderId } from '../types.ts';

// Unified intermediate emitted by every parser; aggregate.ts consumes these.
export interface UsageEvent {
  tool: ToolId;
  provider: ProviderId;
  model: string;          // raw model id from log
  modelLabel?: string;    // optional friendly label
  timestamp: string;      // ISO UTC
  sessionId: string;      // unique within the tool
  projectPath?: string;   // raw cwd if known
  tokens: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
  };
  costUSD?: number;       // only set when source pre-computes (Pi); otherwise computed downstream
}
```

- [ ] **Step 2: Write `src/parsers/util.ts`**

```ts
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function* walkJsonl(root: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw err;
  }
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* walkJsonl(full);
    } else if (entry.isFile() && full.endsWith('.jsonl')) {
      yield full;
    }
  }
}

export async function* readJsonlLines(path: string): AsyncGenerator<unknown> {
  const file = Bun.file(path);
  const text = await file.text();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    try {
      yield JSON.parse(line);
    } catch {
      // skip malformed line
    }
  }
}

const dateFmtCache = new Map<string, Intl.DateTimeFormat>();
function dateFmt(tz: string) {
  let f = dateFmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    });
    dateFmtCache.set(tz, f);
  }
  return f;
}

export function localDate(isoUtc: string, tz: string): string {
  return dateFmt(tz).format(new Date(isoUtc));
}

export function localHour(isoUtc: string, tz: string): number {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', hour12: false,
  });
  // formatToParts gives us a numeric hour
  const parts = f.formatToParts(new Date(isoUtc));
  const h = parts.find(p => p.type === 'hour')?.value ?? '0';
  return Number(h) % 24;
}

// ISO-style week ending on Sunday in the given tz
export function weekEnding(localYmd: string): string {
  // localYmd is YYYY-MM-DD in the target tz; compute Sunday on/after it
  const [y, m, d] = localYmd.split('-').map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!));
  // 0 = Sunday, 1 = Monday, ...
  const dow = date.getUTCDay();
  const daysToSunday = (7 - dow) % 7;
  date.setUTCDate(date.getUTCDate() + daysToSunday);
  return date.toISOString().slice(0, 10);
}
```

- [ ] **Step 3: Verify typecheck**

Run: `cd ~/Developer/tokenmaxing && bun run typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/parsers/types.ts src/parsers/util.ts && git commit -m "feat(parsers): shared UsageEvent type + jsonl walk/date utils"
```

---

## Task 4: Claude Code parser (TDD)

**Files:**
- Create: `~/Developer/tokenmaxing/test/fixtures/claude-code/sample.jsonl`
- Create: `~/Developer/tokenmaxing/src/parsers/claude-code.ts`
- Create: `~/Developer/tokenmaxing/test/parsers.test.ts`

- [ ] **Step 1: Write the fixture**

A real Claude Code session jsonl has many event types; the parser only needs `assistant` messages with `usage`. Create a minimal but realistic fixture at `test/fixtures/claude-code/sample.jsonl`. Inspect a real file first to confirm the schema:

Run: `head -20 ~/.claude/projects/$(ls ~/.claude/projects | head -1)/$(ls ~/.claude/projects/$(ls ~/.claude/projects | head -1) | head -1)`

The relevant lines look like:
```jsonl
{"type":"summary","summary":"...","leafUuid":"..."}
{"sessionId":"abc-123","type":"user","message":{...},"timestamp":"2026-04-20T10:00:00.000Z","cwd":"/Users/nicknisi/Developer/dotfiles"}
{"sessionId":"abc-123","type":"assistant","message":{"id":"msg_01...","model":"claude-opus-4-7","role":"assistant","content":[...],"usage":{"input_tokens":1000,"cache_creation_input_tokens":500,"cache_read_input_tokens":2000,"output_tokens":300}},"timestamp":"2026-04-20T10:00:01.000Z","cwd":"/Users/nicknisi/Developer/dotfiles"}
```

Write the fixture with two assistant messages from the same session, plus a user line that should be ignored:

```jsonl
{"sessionId":"sess-1","type":"user","message":{"role":"user","content":"hi"},"timestamp":"2026-04-20T10:00:00.000Z","cwd":"/Users/nicknisi/Developer/foo-project"}
{"sessionId":"sess-1","type":"assistant","message":{"id":"m1","model":"claude-opus-4-7","role":"assistant","content":[{"type":"text","text":"hello"}],"usage":{"input_tokens":1000,"cache_creation_input_tokens":500,"cache_read_input_tokens":2000,"output_tokens":300}},"timestamp":"2026-04-20T10:00:01.000Z","cwd":"/Users/nicknisi/Developer/foo-project"}
{"sessionId":"sess-1","type":"assistant","message":{"id":"m2","model":"claude-opus-4-7","role":"assistant","content":[{"type":"text","text":"world"}],"usage":{"input_tokens":1500,"cache_creation_input_tokens":0,"cache_read_input_tokens":2500,"output_tokens":200}},"timestamp":"2026-04-20T10:00:05.000Z","cwd":"/Users/nicknisi/Developer/foo-project"}
```

(Place this file with the directory layout `test/fixtures/claude-code/projects/-Users-nicknisi-Developer-foo-project/abc.jsonl` so the parser receives a realistic tree.)

```bash
mkdir -p ~/Developer/tokenmaxing/test/fixtures/claude-code/projects/-Users-nicknisi-Developer-foo-project
# Then write the file at that path with the content above.
```

- [ ] **Step 2: Write the failing test**

Append to `~/Developer/tokenmaxing/test/parsers.test.ts`:

```ts
import { test, expect } from 'bun:test';
import { parseClaudeCode } from '../src/parsers/claude-code.ts';

test('parseClaudeCode: extracts usage events from sample fixture', async () => {
  const events = await parseClaudeCode('test/fixtures/claude-code');
  expect(events).toHaveLength(2);
  expect(events[0]).toMatchObject({
    tool: 'claude-code',
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    sessionId: 'sess-1',
    projectPath: '/Users/nicknisi/Developer/foo-project',
    tokens: { input: 1000, output: 300, cacheRead: 2000, cacheWrite: 500 },
  });
  expect(events[0].costUSD).toBeUndefined(); // Claude Code doesn't pre-compute
});

test('parseClaudeCode: missing root returns empty', async () => {
  const events = await parseClaudeCode('test/fixtures/does-not-exist');
  expect(events).toEqual([]);
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Write `src/parsers/claude-code.ts`**

```ts
import type { UsageEvent } from './types.ts';
import { walkJsonl, readJsonlLines } from './util.ts';

interface ClaudeAssistantLine {
  type: 'assistant';
  sessionId?: string;
  cwd?: string;
  timestamp?: string;
  message?: {
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
}

function isAssistantLine(v: unknown): v is ClaudeAssistantLine {
  return !!v && typeof v === 'object' && (v as { type?: unknown }).type === 'assistant';
}

export async function parseClaudeCode(root: string): Promise<UsageEvent[]> {
  const events: UsageEvent[] = [];
  for await (const path of walkJsonl(root)) {
    for await (const line of readJsonlLines(path)) {
      if (!isAssistantLine(line)) continue;
      const u = line.message?.usage;
      const model = line.message?.model;
      const ts = line.timestamp;
      const sid = line.sessionId;
      if (!u || !model || !ts || !sid) continue;
      events.push({
        tool: 'claude-code',
        provider: 'anthropic',
        model,
        timestamp: ts,
        sessionId: sid,
        projectPath: line.cwd,
        tokens: {
          input:      u.input_tokens               ?? 0,
          output:     u.output_tokens              ?? 0,
          cacheRead:  u.cache_read_input_tokens    ?? 0,
          cacheWrite: u.cache_creation_input_tokens ?? 0,
        },
      });
    }
  }
  return events;
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: 2 pass.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/tokenmaxing && git add test/fixtures/claude-code src/parsers/claude-code.ts test/parsers.test.ts && git commit -m "feat(parsers): claude code session jsonl parser"
```

---

## Task 5: Pi parser (TDD)

**Files:**
- Create: `~/Developer/tokenmaxing/test/fixtures/pi/agent/sessions/-Users-nicknisi-Developer-foo--/sample.jsonl`
- Create: `~/Developer/tokenmaxing/src/parsers/pi.ts`
- Modify: `~/Developer/tokenmaxing/test/parsers.test.ts`

- [ ] **Step 1: Write fixture**

```bash
mkdir -p ~/Developer/tokenmaxing/test/fixtures/pi/agent/sessions/--Users-nicknisi-Developer-foo--
```

Fixture content (`sample.jsonl`):

```jsonl
{"type":"session","version":3,"id":"pi-sess-1","timestamp":"2026-04-21T10:00:00.000Z","cwd":"/Users/nicknisi/Developer/foo"}
{"type":"model_change","timestamp":"2026-04-21T10:00:00.001Z","provider":"anthropic","modelId":"claude-opus-4-7"}
{"type":"message","timestamp":"2026-04-21T10:00:05.000Z","message":{"role":"assistant","content":[{"type":"text","text":"hi"}]},"provider":"anthropic","model":"claude-opus-4-7","usage":{"input":2052,"output":148,"cacheRead":0,"cacheWrite":0,"totalTokens":2200,"cost":{"input":0.01026,"output":0.0037,"cacheRead":0,"cacheWrite":0,"total":0.01396}}}
{"type":"message","timestamp":"2026-04-21T10:01:00.000Z","message":{"role":"assistant","content":[]},"provider":"anthropic","model":"claude-opus-4-7","usage":{"input":3498,"output":104,"cacheRead":0,"cacheWrite":0,"totalTokens":3602,"cost":{"input":0.01749,"output":0.0026,"cacheRead":0,"cacheWrite":0,"total":0.02009}}}
```

- [ ] **Step 2: Write the failing test**

Append to `test/parsers.test.ts`:

```ts
import { parsePi } from '../src/parsers/pi.ts';

test('parsePi: extracts usage with pre-computed cost', async () => {
  const events = await parsePi('test/fixtures/pi/agent/sessions');
  expect(events).toHaveLength(2);
  expect(events[0]).toMatchObject({
    tool: 'pi',
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    sessionId: 'pi-sess-1',
    projectPath: '/Users/nicknisi/Developer/foo',
    tokens: { input: 2052, output: 148, cacheRead: 0, cacheWrite: 0 },
    costUSD: 0.01396,
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Write `src/parsers/pi.ts`**

```ts
import type { UsageEvent } from './types.ts';
import { walkJsonl, readJsonlLines } from './util.ts';

interface PiSessionLine {
  type: 'session';
  id: string;
  cwd?: string;
}
interface PiMessageLine {
  type: 'message';
  timestamp: string;
  message?: { role?: string };
  provider?: string;
  model?: string;
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    cost?: { total?: number };
  };
}

function isSession(v: unknown): v is PiSessionLine {
  return !!v && typeof v === 'object' && (v as { type?: unknown }).type === 'session';
}
function isMessage(v: unknown): v is PiMessageLine {
  return !!v && typeof v === 'object' && (v as { type?: unknown }).type === 'message';
}

export async function parsePi(root: string): Promise<UsageEvent[]> {
  const events: UsageEvent[] = [];
  for await (const path of walkJsonl(root)) {
    let session: PiSessionLine | null = null;
    for await (const line of readJsonlLines(path)) {
      if (isSession(line)) {
        session = line;
        continue;
      }
      if (!isMessage(line)) continue;
      if (line.message?.role !== 'assistant') continue;
      if (!line.usage || !line.provider || !line.model || !session) continue;
      events.push({
        tool: 'pi',
        provider: line.provider,
        model: line.model,
        timestamp: line.timestamp,
        sessionId: session.id,
        projectPath: session.cwd,
        tokens: {
          input:      line.usage.input      ?? 0,
          output:     line.usage.output     ?? 0,
          cacheRead:  line.usage.cacheRead  ?? 0,
          cacheWrite: line.usage.cacheWrite ?? 0,
        },
        costUSD: line.usage.cost?.total,
      });
    }
  }
  return events;
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: 3 pass total (claude-code 2 + pi 1).

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/tokenmaxing && git add test/fixtures/pi src/parsers/pi.ts test/parsers.test.ts && git commit -m "feat(parsers): pi session jsonl parser"
```

---

## Task 6: Codex parser (TDD)

**Files:**
- Create: `~/Developer/tokenmaxing/test/fixtures/codex/sessions/2026/04/22/sample.jsonl`
- Create: `~/Developer/tokenmaxing/src/parsers/codex.ts`
- Modify: `~/Developer/tokenmaxing/test/parsers.test.ts`

- [ ] **Step 1: Verify Codex log path on the user's machine**

Run: `ls ~/.codex/sessions 2>/dev/null | head; ls ~/.codex 2>/dev/null`
Inspect what's there. If the path differs from `~/.codex/sessions/`, update the spec's "open questions" reference and use the actual path in `index.ts` Task 11. If `~/.codex` doesn't exist yet, the parser still needs to compile and gracefully return `[]`.

Also peek at one session file if any exist: `head -10 $(find ~/.codex/sessions -name '*.jsonl' 2>/dev/null | head -1)` to verify schema.

If schema differs materially from the assumption below (assistant messages with `info.tokens_usage` or similar), adjust the parser interface. Below assumes a schema where each assistant turn has a `type: "response"` with `model`, `usage` (`input_tokens`, `output_tokens`, `cached_tokens`), session metadata at the top of the file.

- [ ] **Step 2: Write fixture (assumed schema)**

```bash
mkdir -p ~/Developer/tokenmaxing/test/fixtures/codex/sessions/2026/04/22
```

Fixture (`sample.jsonl`) — adjust if actual Codex schema differs:

```jsonl
{"type":"session_meta","id":"codex-sess-1","timestamp":"2026-04-22T10:00:00.000Z","cwd":"/Users/nicknisi/Developer/foo","model":"gpt-5-codex"}
{"type":"response","timestamp":"2026-04-22T10:00:05.000Z","model":"gpt-5-codex","usage":{"input_tokens":1500,"output_tokens":400,"cached_tokens":0}}
```

- [ ] **Step 3: Write the failing test**

Append to `test/parsers.test.ts`:

```ts
import { parseCodex } from '../src/parsers/codex.ts';

test('parseCodex: extracts usage events', async () => {
  const events = await parseCodex('test/fixtures/codex/sessions');
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    tool: 'codex',
    provider: 'openai',
    model: 'gpt-5-codex',
    sessionId: 'codex-sess-1',
    projectPath: '/Users/nicknisi/Developer/foo',
    tokens: { input: 1500, output: 400, cacheRead: 0, cacheWrite: 0 },
  });
  expect(events[0].costUSD).toBeUndefined();
});

test('parseCodex: missing root returns empty', async () => {
  const events = await parseCodex('test/fixtures/codex-missing');
  expect(events).toEqual([]);
});
```

- [ ] **Step 4: Run test, verify it fails**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 5: Write `src/parsers/codex.ts`**

```ts
import type { UsageEvent } from './types.ts';
import { walkJsonl, readJsonlLines } from './util.ts';

interface CodexMeta {
  type: 'session_meta';
  id: string;
  cwd?: string;
}
interface CodexResponse {
  type: 'response';
  timestamp: string;
  model: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cached_tokens?: number;
  };
}

function isMeta(v: unknown): v is CodexMeta {
  return !!v && typeof v === 'object' && (v as { type?: unknown }).type === 'session_meta';
}
function isResponse(v: unknown): v is CodexResponse {
  return !!v && typeof v === 'object' && (v as { type?: unknown }).type === 'response';
}

export async function parseCodex(root: string): Promise<UsageEvent[]> {
  const events: UsageEvent[] = [];
  for await (const path of walkJsonl(root)) {
    let meta: CodexMeta | null = null;
    for await (const line of readJsonlLines(path)) {
      if (isMeta(line)) { meta = line; continue; }
      if (!isResponse(line) || !line.usage || !meta) continue;
      events.push({
        tool: 'codex',
        provider: 'openai',
        model: line.model,
        timestamp: line.timestamp,
        sessionId: meta.id,
        projectPath: meta.cwd,
        tokens: {
          input:      line.usage.input_tokens  ?? 0,
          output:     line.usage.output_tokens ?? 0,
          cacheRead:  line.usage.cached_tokens ?? 0,
          cacheWrite: 0,
        },
      });
    }
  }
  return events;
}
```

- [ ] **Step 6: Run test, verify it passes**

Run: `cd ~/Developer/tokenmaxing && bun test test/parsers.test.ts`
Expected: 5 pass.

- [ ] **Step 7: Commit**

```bash
cd ~/Developer/tokenmaxing && git add test/fixtures/codex src/parsers/codex.ts test/parsers.test.ts && git commit -m "feat(parsers): codex session jsonl parser"
```

---

## Task 7: GitHub PR fetcher

**Files:**
- Create: `~/Developer/tokenmaxing/src/github.ts`

This wraps `gh search prs` rather than making raw API calls (auth is handled by gh CLI; no PAT to manage).

- [ ] **Step 1: Write `src/github.ts`**

```ts
import type { PullRequest } from './types.ts';

interface GhPrRow {
  url: string;
  repository: { nameWithOwner: string };
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED';
  isDraft?: boolean;
  // gh search prs doesn't expose mergedAt directly via --json on all versions.
  // We rely on `state` + a follow-up `gh pr view` for additions/deletions/mergedAt.
  createdAt: string;
}

interface GhPrViewRow {
  additions: number;
  deletions: number;
  mergedAt: string | null;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
}

async function gh(args: string[]): Promise<string> {
  const proc = Bun.spawn(['gh', ...args], { stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  if (code !== 0) throw new Error(`gh ${args.join(' ')} failed: ${stderr.trim()}`);
  return stdout;
}

function normalizeState(s: 'OPEN' | 'MERGED' | 'CLOSED'): PullRequest['state'] {
  return s === 'MERGED' ? 'merged' : s === 'OPEN' ? 'open' : 'closed';
}

export async function fetchPullRequests(user: string, fromYmd: string, toYmd: string): Promise<PullRequest[]> {
  // Step 1: list PRs in the date window
  const listJson = await gh([
    'search', 'prs',
    `--author=${user}`,
    `--created=${fromYmd}..${toYmd}`,
    '--limit', '1000',
    '--json', 'url,repository,number,title,state,createdAt',
  ]);
  const rows: GhPrRow[] = JSON.parse(listJson);

  // Step 2: enrich each with additions/deletions/mergedAt
  const out: PullRequest[] = [];
  for (const row of rows) {
    const detailJson = await gh([
      'pr', 'view', String(row.number),
      '--repo', row.repository.nameWithOwner,
      '--json', 'additions,deletions,mergedAt,state',
    ]);
    const d: GhPrViewRow = JSON.parse(detailJson);
    out.push({
      url: row.url,
      repo: row.repository.nameWithOwner,
      number: row.number,
      title: row.title,
      state: normalizeState(d.state),
      additions: d.additions,
      deletions: d.deletions,
      createdAt: row.createdAt,
      mergedAt: d.mergedAt,
    });
  }
  return out;
}
```

- [ ] **Step 2: Smoke test by hand**

Run (will hit GitHub via `gh`):
```bash
cd ~/Developer/tokenmaxing && bun -e '
import { fetchPullRequests } from "./src/github.ts";
const prs = await fetchPullRequests("nicknisi", "2026-04-01", "2026-04-28");
console.log(JSON.stringify(prs.slice(0, 3), null, 2));
'
```
Expected: prints up to 3 PRs as JSON. If `gh auth status` is fine and the user has PRs in the window, this should succeed.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/github.ts && git commit -m "feat(github): pr fetcher via gh cli"
```

---

## Task 8: Aggregator (TDD)

**Files:**
- Create: `~/Developer/tokenmaxing/src/aggregate.ts`
- Create: `~/Developer/tokenmaxing/test/aggregate.test.ts`

This is the heart of the generator. TDD aggressively — sort orders, streak math, week boundaries, cost computation per source.

- [ ] **Step 1: Write the failing test (table-driven)**

`~/Developer/tokenmaxing/test/aggregate.test.ts`:

```ts
import { test, expect } from 'bun:test';
import { aggregate } from '../src/aggregate.ts';
import type { UsageEvent } from '../src/parsers/types.ts';
import type { PullRequest } from '../src/types.ts';

const TZ = 'America/Chicago';
const NOW = '2026-04-28T15:00:00.000Z';

function ev(over: Partial<UsageEvent> = {}): UsageEvent {
  return {
    tool: 'claude-code',
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    timestamp: '2026-04-28T15:00:00.000Z',
    sessionId: 's1',
    projectPath: '/Users/nicknisi/Developer/foo',
    tokens: { input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0 },
    ...over,
  };
}

test('aggregate: empty input produces empty shape', () => {
  const out = aggregate({ events: [], prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(out.summary.totalCostUSD).toBe(0);
  expect(out.summary.totalTokens).toBe(0);
  expect(out.byTool).toEqual([]);
  expect(out.daily).toEqual([]);
});

test('aggregate: claude-code event computes cost from pricing table', () => {
  const out = aggregate({ events: [ev()], prs: [], now: NOW, tz: TZ, exclude: new Set() });
  // Opus 4.7: 1M input @ $15 + 1M output @ $75 = $90
  expect(out.summary.totalCostUSD).toBeCloseTo(90, 4);
  expect(out.summary.totalTokens).toBe(2_000_000);
  expect(out.summary.sessions).toBe(1);
});

test('aggregate: pi event uses pre-computed cost', () => {
  const piEvent = ev({ tool: 'pi', sessionId: 'p1', costUSD: 0.5 });
  const out = aggregate({ events: [piEvent], prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(out.summary.totalCostUSD).toBeCloseTo(0.5, 4);
});

test('aggregate: byTool/byProvider/byModel sorted by costUSD desc', () => {
  const events = [
    ev({ tool: 'claude-code', sessionId: 'a' }),                      // $90
    ev({ tool: 'pi', sessionId: 'b', costUSD: 0.5 }),
    ev({ tool: 'codex', model: 'gpt-5-codex', sessionId: 'c',
         tokens: { input: 1_000_000, output: 0, cacheRead: 0, cacheWrite: 0 } }),  // $5
  ];
  const out = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(out.byTool.map(t => t.id)).toEqual(['claude-code', 'codex', 'pi']);
});

test('aggregate: byProject excludes blocklisted basenames', () => {
  const events = [
    ev({ projectPath: '/X/foo', sessionId: 's1' }),
    ev({ projectPath: '/X/secret', sessionId: 's2' }),
  ];
  const out = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set(['secret']) });
  expect(out.byProject.map(p => p.label)).toEqual(['foo']);
  // Excluded events drop out of totals entirely
  expect(out.summary.sessions).toBe(1);
});

test('aggregate: streak counts contiguous active days ending today', () => {
  const events = [
    ev({ timestamp: '2026-04-26T15:00:00.000Z', sessionId: 's1' }),
    ev({ timestamp: '2026-04-27T15:00:00.000Z', sessionId: 's2' }),
    ev({ timestamp: '2026-04-28T15:00:00.000Z', sessionId: 's3' }),
  ];
  const out = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(out.summary.currentStreakDays).toBe(3);
  expect(out.summary.longestStreakDays).toBe(3);
});

test('aggregate: streak resets when today is inactive', () => {
  const events = [
    ev({ timestamp: '2026-04-26T15:00:00.000Z', sessionId: 's1' }),
    ev({ timestamp: '2026-04-27T15:00:00.000Z', sessionId: 's2' }),
    // no event on 2026-04-28
  ];
  const out = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(out.summary.currentStreakDays).toBe(0);
  expect(out.summary.longestStreakDays).toBe(2);
});

test('aggregate: weeklyHighlights groups PRs by week-ending Sunday, sorted by size desc', () => {
  const prs: PullRequest[] = [
    { url: 'u1', repo: 'r/a', number: 1, title: 't1', state: 'merged',
      additions: 10, deletions: 5, createdAt: '2026-04-22T10:00:00.000Z', mergedAt: '2026-04-23T00:00:00.000Z' },
    { url: 'u2', repo: 'r/b', number: 2, title: 't2', state: 'merged',
      additions: 100, deletions: 50, createdAt: '2026-04-22T10:00:00.000Z', mergedAt: '2026-04-23T00:00:00.000Z' },
  ];
  const out = aggregate({ events: [], prs, now: NOW, tz: TZ, exclude: new Set() });
  expect(out.weeklyHighlights).toHaveLength(1);
  expect(out.weeklyHighlights[0]!.weekEnding).toBe('2026-04-26'); // Sunday
  expect(out.weeklyHighlights[0]!.pullRequests.map(p => p.number)).toEqual([2, 1]);
});

test('aggregate: deterministic — same input produces same output', () => {
  const events = [
    ev({ projectPath: '/x/a', sessionId: 's1' }),
    ev({ projectPath: '/x/b', sessionId: 's2' }),
  ];
  const a = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set() });
  const b = aggregate({ events, prs: [], now: NOW, tz: TZ, exclude: new Set() });
  expect(JSON.stringify(a)).toBe(JSON.stringify(b));
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `cd ~/Developer/tokenmaxing && bun test test/aggregate.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/aggregate.ts`**

```ts
import type {
  TokenmaxingData, ToolBreakdown, ProviderBreakdown, ModelBreakdown,
  ProjectBreakdown, DailyEntry, WeeklyHighlight, PullRequest, ToolId, ModelRef,
} from './types.ts';
import type { UsageEvent } from './parsers/types.ts';
import { computeCost } from './pricing.ts';
import { localDate, localHour, weekEnding } from './parsers/util.ts';
import { basename } from 'node:path';

const TOOL_LABEL: Record<ToolId, string> = {
  'claude-code': 'Claude Code', 'pi': 'Pi', 'codex': 'Codex',
};

const PROVIDER_LABEL: Record<string, string> = {
  anthropic: 'Anthropic', openai: 'OpenAI', baseten: 'Baseten',
};

export interface AggregateInput {
  events: UsageEvent[];
  prs: PullRequest[];
  now: string;             // ISO UTC; used for "today" / `generatedAt`
  tz: string;              // e.g. "America/Chicago"
  exclude: Set<string>;    // project basenames to drop
}

interface EnrichedEvent {
  e: UsageEvent;
  cost: number;
  date: string;     // YYYY-MM-DD local
  hour: number;     // 0..23 local
  basename: string; // project basename or "unknown"
}

function enrich(events: UsageEvent[], tz: string): EnrichedEvent[] {
  return events.map(e => {
    const cost = e.costUSD ?? computeCost(e.model, e.tokens);
    return {
      e,
      cost,
      date: localDate(e.timestamp, tz),
      hour: localHour(e.timestamp, tz),
      basename: e.projectPath ? basename(e.projectPath) : 'unknown',
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function totalTokens(t: UsageEvent['tokens']): number {
  return t.input + t.output + t.cacheRead + t.cacheWrite;
}

function computeStreaks(activeDates: Set<string>, todayLocal: string): { current: number; longest: number } {
  if (activeDates.size === 0) return { current: 0, longest: 0 };
  const sorted = [...activeDates].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]! + 'T00:00:00Z');
    const cur  = new Date(sorted[i]!     + 'T00:00:00Z');
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = diff === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  // current: streak ending today, only if today is active
  let current = 0;
  if (activeDates.has(todayLocal)) {
    let cursor = new Date(todayLocal + 'T00:00:00Z');
    while (activeDates.has(cursor.toISOString().slice(0, 10))) {
      current++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }
  return { current, longest };
}

function peakHour(enriched: EnrichedEvent[]): number {
  if (enriched.length === 0) return 0;
  const counts = new Array(24).fill(0);
  for (const x of enriched) counts[x.hour]++;
  let best = 0, bestCount = -1;
  for (let h = 0; h < 24; h++) {
    if (counts[h] > bestCount) { bestCount = counts[h]; best = h; }
  }
  return best;
}

function favoriteModel(enriched: EnrichedEvent[]): ModelRef {
  if (enriched.length === 0) {
    return { tool: 'claude-code', provider: 'anthropic', id: 'unknown', label: 'Unknown' };
  }
  // count messages per (tool|provider|model)
  const counts = new Map<string, { ref: ModelRef; n: number }>();
  for (const x of enriched) {
    const key = `${x.e.tool}|${x.e.provider}|${x.e.model}`;
    const ref: ModelRef = {
      tool: x.e.tool, provider: x.e.provider, id: x.e.model,
      label: x.e.modelLabel ?? x.e.model,
    };
    const c = counts.get(key);
    if (c) c.n++; else counts.set(key, { ref, n: 1 });
  }
  let bestKey = '';
  let bestN = -1;
  for (const [k, v] of counts) {
    if (v.n > bestN) { bestN = v.n; bestKey = k; }
  }
  return counts.get(bestKey)!.ref;
}

function groupBy<K extends string, V>(items: V[], keyFn: (v: V) => K): Map<K, V[]> {
  const out = new Map<K, V[]>();
  for (const v of items) {
    const k = keyFn(v);
    const arr = out.get(k);
    if (arr) arr.push(v); else out.set(k, [v]);
  }
  return out;
}

export function aggregate(input: AggregateInput): TokenmaxingData {
  const tz = input.tz;
  const filtered = input.events.filter(e => {
    const b = e.projectPath ? basename(e.projectPath) : 'unknown';
    return !input.exclude.has(b);
  });
  const enriched = enrich(filtered, tz);

  // ----- byTool -----
  const byToolMap = new Map<ToolId, { tokens: number; cost: number; sessions: Set<string>; messages: number }>();
  for (const x of enriched) {
    const k = x.e.tool;
    const slot = byToolMap.get(k) ?? { tokens: 0, cost: 0, sessions: new Set(), messages: 0 };
    slot.tokens += totalTokens(x.e.tokens);
    slot.cost   += x.cost;
    slot.sessions.add(`${k}|${x.e.sessionId}`);
    slot.messages++;
    byToolMap.set(k, slot);
  }
  const byTool: ToolBreakdown[] = [...byToolMap.entries()]
    .map(([id, v]) => ({ id, label: TOOL_LABEL[id], tokens: v.tokens, costUSD: round2(v.cost), sessions: v.sessions.size, messages: v.messages }))
    .sort((a, b) => b.costUSD - a.costUSD);

  // ----- byProvider -----
  const byProviderMap = new Map<string, { tokens: number; cost: number }>();
  for (const x of enriched) {
    const k = x.e.provider;
    const slot = byProviderMap.get(k) ?? { tokens: 0, cost: 0 };
    slot.tokens += totalTokens(x.e.tokens);
    slot.cost   += x.cost;
    byProviderMap.set(k, slot);
  }
  const byProvider: ProviderBreakdown[] = [...byProviderMap.entries()]
    .map(([id, v]) => ({ id, label: PROVIDER_LABEL[id] ?? id, tokens: v.tokens, costUSD: round2(v.cost) }))
    .sort((a, b) => b.costUSD - a.costUSD);

  // ----- byModel -----
  const byModelMap = new Map<string, { ref: ModelRef; tokens: number; cost: number; sessions: Set<string>; messages: number }>();
  for (const x of enriched) {
    const k = `${x.e.tool}|${x.e.provider}|${x.e.model}`;
    const slot = byModelMap.get(k) ?? {
      ref: { tool: x.e.tool, provider: x.e.provider, id: x.e.model, label: x.e.modelLabel ?? x.e.model },
      tokens: 0, cost: 0, sessions: new Set(), messages: 0,
    };
    slot.tokens += totalTokens(x.e.tokens);
    slot.cost   += x.cost;
    slot.sessions.add(`${x.e.tool}|${x.e.sessionId}`);
    slot.messages++;
    byModelMap.set(k, slot);
  }
  const byModel: ModelBreakdown[] = [...byModelMap.values()]
    .map(v => ({ ...v.ref, tokens: v.tokens, costUSD: round2(v.cost), sessions: v.sessions.size, messages: v.messages }))
    .sort((a, b) => b.costUSD - a.costUSD);

  // ----- byProject -----
  const byProjectMap = new Map<string, { tokens: number; cost: number; sessions: Set<string> }>();
  for (const x of enriched) {
    const slot = byProjectMap.get(x.basename) ?? { tokens: 0, cost: 0, sessions: new Set() };
    slot.tokens += totalTokens(x.e.tokens);
    slot.cost   += x.cost;
    slot.sessions.add(`${x.e.tool}|${x.e.sessionId}`);
    byProjectMap.set(x.basename, slot);
  }
  const byProject: ProjectBreakdown[] = [...byProjectMap.entries()]
    .map(([label, v]) => ({ label, tokens: v.tokens, costUSD: round2(v.cost), sessions: v.sessions.size }))
    .sort((a, b) => b.costUSD - a.costUSD);

  // ----- daily -----
  const dailyMap = new Map<string, DailyEntry>();
  const sessionsPerDay = new Map<string, Set<string>>();
  for (const x of enriched) {
    const slot = dailyMap.get(x.date) ?? {
      date: x.date, tokens: 0, costUSD: 0, sessions: 0, messages: 0, byTool: {},
    };
    const tt = totalTokens(x.e.tokens);
    slot.tokens += tt;
    slot.costUSD = round2(slot.costUSD + x.cost);
    slot.messages++;
    const tBucket = slot.byTool[x.e.tool] ?? { tokens: 0, costUSD: 0 };
    tBucket.tokens += tt;
    tBucket.costUSD = round2(tBucket.costUSD + x.cost);
    slot.byTool[x.e.tool] = tBucket;
    dailyMap.set(x.date, slot);

    const sset = sessionsPerDay.get(x.date) ?? new Set();
    sset.add(`${x.e.tool}|${x.e.sessionId}`);
    sessionsPerDay.set(x.date, sset);
  }
  for (const [date, slot] of dailyMap) {
    slot.sessions = sessionsPerDay.get(date)?.size ?? 0;
  }
  const daily: DailyEntry[] = [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  // ----- summary -----
  const totalCostUSD = round2(enriched.reduce((s, x) => s + x.cost, 0));
  const tokenSum = enriched.reduce((s, x) => s + totalTokens(x.e.tokens), 0);
  const allSessions = new Set<string>();
  for (const x of enriched) allSessions.add(`${x.e.tool}|${x.e.sessionId}`);
  const activeDates = new Set(enriched.map(x => x.date));
  const todayLocal = localDate(input.now, tz);
  const { current, longest } = computeStreaks(activeDates, todayLocal);

  // ----- period -----
  const dates = [...activeDates].sort();
  const period = {
    from: dates[0] ?? todayLocal,
    to: todayLocal,
  };

  // ----- weeklyHighlights -----
  const weekMap = new Map<string, PullRequest[]>();
  for (const pr of input.prs) {
    const ts = pr.mergedAt ?? pr.createdAt;
    const localDay = localDate(ts, tz);
    const wk = weekEnding(localDay);
    const arr = weekMap.get(wk) ?? [];
    arr.push(pr);
    weekMap.set(wk, arr);
  }
  const weeklyHighlights: WeeklyHighlight[] = [...weekMap.entries()]
    .map(([weekEnding, prs]) => ({
      weekEnding,
      pullRequests: [...prs].sort((a, b) =>
        (b.additions + b.deletions) - (a.additions + a.deletions)
      ),
    }))
    .sort((a, b) => b.weekEnding.localeCompare(a.weekEnding));

  return {
    schemaVersion: 1,
    generatedAt: input.now,
    period,
    summary: {
      totalCostUSD,
      totalTokens: tokenSum,
      sessions: allSessions.size,
      messages: enriched.length,
      activeDays: activeDates.size,
      currentStreakDays: current,
      longestStreakDays: longest,
      peakHourLocal: peakHour(enriched),
      favoriteModel: favoriteModel(enriched),
    },
    byTool, byProvider, byModel, byProject, daily, weeklyHighlights,
  };
}
```

- [ ] **Step 4: Run tests, verify all pass**

Run: `cd ~/Developer/tokenmaxing && bun test`
Expected: 14 pass (4 pricing + 5 parsers + 9 aggregate). Adjust counts if you've added more.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/aggregate.ts test/aggregate.test.ts && git commit -m "feat(aggregate): combine usage events + PRs into final shape"
```

---

## Task 9: Config loader

**Files:**
- Create: `~/Developer/tokenmaxing/src/config.ts`

- [ ] **Step 1: Write `src/config.ts`**

```ts
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

export interface Config {
  gistId: string;
  deployHookUrl: string;
  githubUser: string;
  timezone: string;
  excludeBasenames: Set<string>;
  paths: {
    claudeCode: string;
    pi: string;
    codex: string;
  };
}

const ROOT = join(homedir(), '.config', 'tokenmaxing');

async function readEnv(): Promise<Record<string, string>> {
  const path = join(ROOT, '.env');
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch {
    throw new Error(`Missing config: ${path}. See README for required keys.`);
  }
  const out: Record<string, string> = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

async function readExclude(): Promise<Set<string>> {
  const path = join(ROOT, 'exclude.json');
  try {
    const text = await readFile(path, 'utf8');
    const parsed = JSON.parse(text);
    return new Set(Array.isArray(parsed.projectBasenames) ? parsed.projectBasenames : []);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return new Set();
    throw err;
  }
}

export async function loadConfig(): Promise<Config> {
  const env = await readEnv();
  const need = (k: string) => {
    const v = env[k];
    if (!v) throw new Error(`Missing required key in ~/.config/tokenmaxing/.env: ${k}`);
    return v;
  };
  return {
    gistId: need('GIST_ID'),
    deployHookUrl: need('CLOUDFLARE_DEPLOY_HOOK_URL'),
    githubUser: need('GITHUB_USER'),
    timezone: env['TIMEZONE'] ?? 'America/Chicago',
    excludeBasenames: await readExclude(),
    paths: {
      claudeCode: join(homedir(), '.claude', 'projects'),
      pi:         join(homedir(), '.pi', 'agent', 'sessions'),
      codex:      join(homedir(), '.codex', 'sessions'),
    },
  };
}
```

- [ ] **Step 2: Verify typecheck**

Run: `cd ~/Developer/tokenmaxing && bun run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/config.ts && git commit -m "feat(config): load env + exclude.json from ~/.config/tokenmaxing"
```

---

## Task 10: Publisher (gist + deploy hook)

**Files:**
- Create: `~/Developer/tokenmaxing/src/publish.ts`

- [ ] **Step 1: Write `src/publish.ts`**

```ts
import type { TokenmaxingData } from './types.ts';

export async function writeGist(gistId: string, data: TokenmaxingData): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  // gh gist edit accepts the new content from a file; pipe via stdin is simplest.
  const proc = Bun.spawn(['gh', 'gist', 'edit', gistId, '--filename', 'tokenmaxing.json', '-'], {
    stdin: 'pipe', stdout: 'pipe', stderr: 'pipe',
  });
  proc.stdin.write(json);
  await proc.stdin.end();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(`gh gist edit failed: ${stderr.trim()}`);
}

export async function readGist(gistId: string): Promise<TokenmaxingData | null> {
  const proc = Bun.spawn(['gh', 'gist', 'view', gistId, '--filename', 'tokenmaxing.json', '--raw'], {
    stdout: 'pipe', stderr: 'pipe',
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const code = await proc.exited;
  if (code !== 0) {
    if (stderr.includes('not found')) return null;
    throw new Error(`gh gist view failed: ${stderr.trim()}`);
  }
  try { return JSON.parse(stdout); } catch { return null; }
}

export async function triggerDeploy(hookUrl: string): Promise<void> {
  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`deploy hook returned ${res.status}: ${await res.text()}`);
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `cd ~/Developer/tokenmaxing && bun run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/publish.ts && git commit -m "feat(publish): gist write/read + deploy hook trigger via gh"
```

---

## Task 11: CLI dispatcher

**Files:**
- Create: `~/Developer/tokenmaxing/src/index.ts`

- [ ] **Step 1: Write `src/index.ts`**

```ts
#!/usr/bin/env bun
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadConfig } from './config.ts';
import { parseClaudeCode } from './parsers/claude-code.ts';
import { parsePi }         from './parsers/pi.ts';
import { parseCodex }      from './parsers/codex.ts';
import { fetchPullRequests } from './github.ts';
import { aggregate } from './aggregate.ts';
import { writeGist, readGist, triggerDeploy } from './publish.ts';
import type { UsageEvent } from './parsers/types.ts';
import type { TokenmaxingData } from './types.ts';

async function gather(): Promise<TokenmaxingData> {
  const cfg = await loadConfig();
  const [cc, pi, codex] = await Promise.all([
    parseClaudeCode(cfg.paths.claudeCode),
    parsePi(cfg.paths.pi),
    parseCodex(cfg.paths.codex),
  ]);
  const events: UsageEvent[] = [...cc, ...pi, ...codex];

  const dates = events.map(e => e.timestamp).sort();
  const fromYmd = dates[0]?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const toYmd   = new Date().toISOString().slice(0, 10);
  const prs = await fetchPullRequests(cfg.githubUser, fromYmd, toYmd);

  return aggregate({
    events, prs,
    now: new Date().toISOString(),
    tz: cfg.timezone,
    exclude: cfg.excludeBasenames,
  });
}

async function cmdBuild(): Promise<void> {
  const data = await gather();
  const outDir = 'out';
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'tokenmaxing.json'), JSON.stringify(data, null, 2));
  console.log(`wrote out/tokenmaxing.json (${data.summary.messages} messages, $${data.summary.totalCostUSD})`);
}

async function cmdPublish(): Promise<void> {
  const cfg = await loadConfig();
  const data = await gather();
  await writeGist(cfg.gistId, data);
  console.log(`gist updated (${data.summary.messages} messages, $${data.summary.totalCostUSD})`);
  await triggerDeploy(cfg.deployHookUrl);
  console.log('deploy hook triggered');
}

async function cmdDryRun(): Promise<void> {
  const cfg = await loadConfig();
  const next = await gather();
  const current = await readGist(cfg.gistId);
  const changed = JSON.stringify(current) !== JSON.stringify(next);
  console.log(changed ? 'CHANGED — publish would update gist.' : 'No change.');
  if (current && changed) {
    console.log(`current: ${current.summary.messages} msgs, $${current.summary.totalCostUSD}`);
    console.log(`next:    ${next.summary.messages} msgs, $${next.summary.totalCostUSD}`);
  }
}

async function cmdListProjects(): Promise<void> {
  const cfg = await loadConfig();
  const [cc, pi, codex] = await Promise.all([
    parseClaudeCode(cfg.paths.claudeCode),
    parsePi(cfg.paths.pi),
    parseCodex(cfg.paths.codex),
  ]);
  const set = new Set<string>();
  for (const e of [...cc, ...pi, ...codex]) {
    if (e.projectPath) set.add(e.projectPath.split('/').pop() ?? '');
  }
  for (const b of [...set].sort()) console.log(b);
}

const cmd = process.argv[2];
const dispatch: Record<string, () => Promise<void>> = {
  'build': cmdBuild, 'publish': cmdPublish, 'dry-run': cmdDryRun, 'list-projects': cmdListProjects,
};
const handler = cmd ? dispatch[cmd] : undefined;
if (!handler) {
  console.error('usage: tokenmaxing <build|publish|dry-run|list-projects>');
  process.exit(2);
}
await handler();
```

- [ ] **Step 2: Verify typecheck**

Run: `cd ~/Developer/tokenmaxing && bun run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
cd ~/Developer/tokenmaxing && git add src/index.ts && git commit -m "feat(cli): build|publish|dry-run|list-projects commands"
```

---

## Task 12: First end-to-end run + create gist

This task is mostly *operational* (no code changes), but completes Phase 1 by producing a real gist with real data.

- [ ] **Step 1: Configure the local env (no gist yet)**

```bash
mkdir -p ~/.config/tokenmaxing
cat > ~/.config/tokenmaxing/.env <<'EOF'
GIST_ID=PLACEHOLDER
CLOUDFLARE_DEPLOY_HOOK_URL=https://example.invalid/PLACEHOLDER
GITHUB_USER=nicknisi
TIMEZONE=America/Chicago
EOF
```

- [ ] **Step 2: Build locally**

Run: `cd ~/Developer/tokenmaxing && bun run build`
Expected: writes `out/tokenmaxing.json`. Inspect it: top-level keys present, `byProject` basenames look correct, `weeklyHighlights[0].pullRequests` non-empty for recent weeks.

- [ ] **Step 3: Review project basenames for sensitive entries**

Run: `cd ~/Developer/tokenmaxing && bun run list-projects`
If anything sensitive shows, add it to `~/.config/tokenmaxing/exclude.json`:

```json
{ "projectBasenames": ["client-codename"] }
```

Re-run `bun run build` and confirm the entry is gone from `byProject`.

- [ ] **Step 4: Create the public gist**

```bash
gh gist create out/tokenmaxing.json --public --filename tokenmaxing.json --desc "tokenmaxing public data feed"
```

Capture the gist ID from the URL (last path segment) and update `~/.config/tokenmaxing/.env`:

```
GIST_ID=<id-from-step-4>
```

- [ ] **Step 5: Set up Cloudflare deploy hook**

In the Cloudflare Pages dashboard for nicknisi.com → Settings → Builds & deployments → Deploy hooks → "Add deploy hook" → name "tokenmaxing", branch "main". Copy the URL into `~/.config/tokenmaxing/.env` as `CLOUDFLARE_DEPLOY_HOOK_URL`.

- [ ] **Step 6: Dry-run to verify everything's wired**

Run: `cd ~/Developer/tokenmaxing && bun run dry-run`
Expected: `No change.` (since the gist already contains the latest from Step 4) or `CHANGED` if any time has passed.

- [ ] **Step 7: Tag this milestone**

```bash
cd ~/Developer/tokenmaxing && git tag v0.1.0-data-pipeline
```

Phase 1 complete. The gist now contains real data; Phase 2 builds the consumer that reads it.

---

# Phase 2 — Consumer (`~/Developer/nicknisi.com/`)

## Task 13: Astro loader + content collection

**Files:**
- Create: `~/Developer/nicknisi.com/src/loaders/tokenmaxing.ts`
- Modify: `~/Developer/nicknisi.com/src/content/config.ts`

- [ ] **Step 1: Write `src/loaders/tokenmaxing.ts`**

```ts
import type { Loader } from 'astro/loaders';

export const tokenmaxingLoader = ({ user, gistId }: { user: string; gistId: string }): Loader => ({
  name: 'tokenmaxing',
  async load({ store, logger, parseData }) {
    if (!gistId) {
      logger.warn('tokenmaxing: TOKENMAXING_GIST_ID not set; skipping fetch');
      return;
    }
    try {
      const url = `https://gist.githubusercontent.com/${user}/${gistId}/raw/tokenmaxing.json`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`gist fetch ${res.status}`);
      const data = await res.json();
      store.set({ id: 'current', data: await parseData({ id: 'current', data }) });
    } catch (err) {
      logger.error(`tokenmaxing loader: ${(err as Error).message}`);
    }
  },
});
```

- [ ] **Step 2: Modify `src/content/config.ts`**

Locate the existing imports and add the new loader import; add a new `tokenmaxing` collection; export it from `collections`.

```ts
// Existing imports …
import { tokenmaxingLoader } from '@/loaders/tokenmaxing.js';

// … existing collection definitions …

const tokenmaxing = defineCollection({
  loader: tokenmaxingLoader({
    user: 'nicknisi',
    gistId: import.meta.env.TOKENMAXING_GIST_ID ?? '',
  }),
  schema: z.object({
    schemaVersion: z.literal(1),
    generatedAt: z.string(),
    period: z.object({ from: z.string(), to: z.string() }),
    summary: z.object({
      totalCostUSD: z.number(),
      totalTokens: z.number(),
      sessions: z.number(),
      messages: z.number(),
      activeDays: z.number(),
      currentStreakDays: z.number(),
      longestStreakDays: z.number(),
      peakHourLocal: z.number(),
      favoriteModel: z.object({
        tool: z.enum(['claude-code', 'pi', 'codex']),
        provider: z.string(),
        id: z.string(),
        label: z.string(),
      }),
    }),
    byTool: z.array(z.object({
      id: z.enum(['claude-code', 'pi', 'codex']),
      label: z.string(),
      tokens: z.number(),
      costUSD: z.number(),
      sessions: z.number(),
      messages: z.number(),
    })),
    byProvider: z.array(z.object({
      id: z.string(), label: z.string(), tokens: z.number(), costUSD: z.number(),
    })),
    byModel: z.array(z.object({
      tool: z.enum(['claude-code', 'pi', 'codex']),
      provider: z.string(), id: z.string(), label: z.string(),
      tokens: z.number(), costUSD: z.number(), sessions: z.number(), messages: z.number(),
    })),
    byProject: z.array(z.object({
      label: z.string(), tokens: z.number(), costUSD: z.number(), sessions: z.number(),
    })),
    daily: z.array(z.object({
      date: z.string(), tokens: z.number(), costUSD: z.number(),
      sessions: z.number(), messages: z.number(),
      byTool: z.record(z.string(), z.object({ tokens: z.number(), costUSD: z.number() })),
    })),
    weeklyHighlights: z.array(z.object({
      weekEnding: z.string(),
      pullRequests: z.array(z.object({
        url: z.string(), repo: z.string(), number: z.number(), title: z.string(),
        state: z.enum(['open', 'merged', 'closed']),
        additions: z.number(), deletions: z.number(),
        createdAt: z.string(), mergedAt: z.string().nullable(),
      })),
    })),
  }),
});

// Update collections export:
export const collections = {
  posts, jobs, projects, profiles, bluesky, appearances,
  tokenmaxing,
};
```

- [ ] **Step 3: Add the env var to Cloudflare Pages**

In the Cloudflare dashboard → Pages → nicknisi.com → Settings → Environment variables → Production → add `TOKENMAXING_GIST_ID = <gist-id-from-task-12>`. Also add to Preview if desired.

For local dev, add to a `.env` (gitignored already) at the repo root:

```
TOKENMAXING_GIST_ID=<gist-id-from-task-12>
```

- [ ] **Step 4: Verify Astro picks it up**

Run: `cd ~/Developer/nicknisi.com && pnpm run typecheck && pnpm dev`
Expected: dev server boots; logs show the loader running and storing the entry; no schema errors.

Visit `http://localhost:8080` to confirm the existing site still works (the new collection is loaded but not yet rendered).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/nicknisi.com && git add src/loaders/tokenmaxing.ts src/content/config.ts && git commit -m "feat(content): tokenmaxing collection + remote gist loader"
```

---

## Task 14: Page skeleton + StatsGrid

**Files:**
- Create: `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro`
- Create: `~/Developer/nicknisi.com/src/components/tokenmaxing/StatsGrid.astro`
- Create: `~/Developer/nicknisi.com/src/components/tokenmaxing/StaleBadge.astro`
- Create: `~/Developer/nicknisi.com/src/components/tokenmaxing/MobyDickFooter.astro`

- [ ] **Step 1: Write `StatsGrid.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  summary: CollectionEntry<'tokenmaxing'>['data']['summary'];
}
const { summary } = Astro.props;

const fmtInt = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const fmtCompactTokens = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
};

const tiles = [
  { label: 'Total cost',     value: fmtUsd.format(summary.totalCostUSD) },
  { label: 'Total tokens',   value: fmtCompactTokens(summary.totalTokens) },
  { label: 'Sessions',       value: fmtInt.format(summary.sessions) },
  { label: 'Messages',       value: fmtInt.format(summary.messages) },
  { label: 'Active days',    value: fmtInt.format(summary.activeDays) },
  { label: 'Current streak', value: `${summary.currentStreakDays}d` },
  { label: 'Longest streak', value: `${summary.longestStreakDays}d` },
  { label: 'Peak hour',      value: `${summary.peakHourLocal % 12 || 12} ${summary.peakHourLocal < 12 ? 'AM' : 'PM'}` },
  { label: 'Favorite model', value: summary.favoriteModel.label },
];
---
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
  {tiles.map(t => (
    <div class="rounded-lg border border-gray-200 bg-white/60 p-4 dark:border-dark-border dark:bg-dark-surface/60">
      <div class="text-xs text-gray-500 dark:text-gray-400">{t.label}</div>
      <div class="mt-1 font-mono text-2xl font-semibold">{t.value}</div>
    </div>
  ))}
</div>
```

- [ ] **Step 2: Write `StaleBadge.astro`**

```astro
---
interface Props { generatedAt: string; }
const { generatedAt } = Astro.props;
const ageMs = Date.now() - new Date(generatedAt).getTime();
const stale = ageMs > 14 * 24 * 60 * 60 * 1000;
---
{stale && (
  <span class="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200">
    Data may be stale
  </span>
)}
```

- [ ] **Step 3: Write `MobyDickFooter.astro`**

```astro
---
interface Props { totalTokens: number; }
const { totalTokens } = Astro.props;
const MOBY_DICK_TOKENS = 215_000;
const ratio = Math.round(totalTokens / MOBY_DICK_TOKENS);
---
<p class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
  You've used ~{ratio.toLocaleString()}× more tokens than Moby-Dick.
</p>
```

- [ ] **Step 4: Write `src/pages/tokenmaxing.astro` (skeleton)**

```astro
---
import BaseLayout from '@/layouts/Base.astro';
import { getEntry } from 'astro:content';
import StatsGrid from '@/components/tokenmaxing/StatsGrid.astro';
import StaleBadge from '@/components/tokenmaxing/StaleBadge.astro';
import MobyDickFooter from '@/components/tokenmaxing/MobyDickFooter.astro';

const entry = await getEntry('tokenmaxing', 'current');
const data = entry?.data;
---

<BaseLayout title="Tokenmaxing | Nick Nisi" description="Weekly stats on my AI coding-agent usage and public PRs.">
  <section class="mx-auto max-w-6xl px-6 py-12">
    <header class="mb-8">
      <h1 class="font-serif text-4xl font-bold tracking-tight md:text-5xl">Tokenmaxing</h1>
      {data ? (
        <p class="mt-3 text-gray-600 dark:text-gray-400">
          {data.period.from} → {data.period.to} · last updated{' '}
          <time datetime={data.generatedAt}>
            {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </time>
          {' '}
          <StaleBadge generatedAt={data.generatedAt} />
        </p>
      ) : (
        <p class="mt-3 text-gray-600 dark:text-gray-400">Data feed offline — refreshes weekly.</p>
      )}
    </header>

    {data && (
      <>
        <StatsGrid summary={data.summary} />
        <MobyDickFooter totalTokens={data.summary.totalTokens} />
      </>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 5: Run dev server, eyeball the page**

Run: `cd ~/Developer/nicknisi.com && pnpm dev`
Visit: `http://localhost:8080/tokenmaxing`
Expected: header renders with period range and last-updated time; nine stat tiles render with real numbers from the gist; Moby-Dick line at the bottom. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/nicknisi.com && git add src/pages/tokenmaxing.astro src/components/tokenmaxing/ && git commit -m "feat(tokenmaxing): page skeleton with stats grid + stale badge + footer"
```

---

## Task 15: Activity heatmap + interactive Dashboard island

**Files:**
- Create: `~/Developer/nicknisi.com/src/components/tokenmaxing/Dashboard.tsx`
- Modify: `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro`

The Dashboard island owns the time-range toggle, the metric toggle (tokens/cost), the view tabs (overview/by tool/etc), and the heatmap. Static stats remain in the Astro StatsGrid above; everything dynamic lives here.

- [ ] **Step 1: Write `Dashboard.tsx`**

```tsx
import { useMemo, useState } from 'react';

type ToolId = 'claude-code' | 'pi' | 'codex';

export interface DailyEntry {
  date: string; tokens: number; costUSD: number; sessions: number; messages: number;
  byTool: Partial<Record<ToolId, { tokens: number; costUSD: number }>>;
}
export interface Breakdown {
  byTool: Array<{ id: ToolId; label: string; tokens: number; costUSD: number; sessions: number; messages: number }>;
  byProvider: Array<{ id: string; label: string; tokens: number; costUSD: number }>;
  byModel: Array<{ tool: ToolId; provider: string; id: string; label: string; tokens: number; costUSD: number; sessions: number; messages: number }>;
  byProject: Array<{ label: string; tokens: number; costUSD: number; sessions: number }>;
}

interface Props {
  daily: DailyEntry[];
  breakdown: Breakdown;
}

type Range = 'all' | '30d' | '7d';
type Metric = 'tokens' | 'costUSD';
type View = 'overview' | 'tool' | 'provider' | 'model' | 'project';

function filterByRange(daily: DailyEntry[], range: Range): DailyEntry[] {
  if (range === 'all') return daily;
  const days = range === '7d' ? 7 : 30;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffYmd = cutoff.toISOString().slice(0, 10);
  return daily.filter(d => d.date >= cutoffYmd);
}

const fmtInt = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtVal = (m: Metric, n: number) =>
  m === 'costUSD' ? fmtUsd.format(n) : fmtInt.format(n);

function Heatmap({ daily, metric }: { daily: DailyEntry[]; metric: Metric }) {
  // Build a fixed-size 7-row × N-col grid based on date span
  if (daily.length === 0) return null;
  const start = new Date(daily[0]!.date + 'T00:00:00Z');
  const end   = new Date(daily[daily.length - 1]!.date + 'T00:00:00Z');
  const days: { date: string; value: number }[] = [];
  const lookup = new Map(daily.map(d => [d.date, d[metric]]));
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const ymd = d.toISOString().slice(0, 10);
    days.push({ date: ymd, value: lookup.get(ymd) ?? 0 });
  }
  const max = Math.max(1, ...days.map(d => d.value));
  const intensity = (v: number) => {
    if (v <= 0) return 0;
    return Math.min(4, Math.ceil((v / max) * 4));
  };
  const cls = ['bg-gray-200 dark:bg-dark-surface',
               'bg-blue-200 dark:bg-blue-900/40',
               'bg-blue-300 dark:bg-blue-700/60',
               'bg-blue-400 dark:bg-blue-500/80',
               'bg-blue-500 dark:bg-blue-400'];

  // Render as columns of 7 days each (calendar weeks). Pad start to align Sunday=0.
  const startDow = new Date(days[0]!.date + 'T00:00:00Z').getUTCDay();
  const padded = [...new Array(startDow).fill(null), ...days];
  const cols: (typeof padded[number])[][] = [];
  for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));

  return (
    <div class="overflow-x-auto py-2">
      <div class="flex gap-1">
        {cols.map((col, ci) => (
          <div key={ci} class="flex flex-col gap-1">
            {col.map((cell, ri) => cell ? (
              <div
                key={cell.date}
                title={`${cell.date}: ${fmtVal(metric, cell.value)}`}
                class={`h-3 w-3 rounded-sm ${cls[intensity(cell.value)]}`}
              />
            ) : <div key={`pad-${ci}-${ri}`} class="h-3 w-3" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownTable({ rows, metric }: { rows: { label: string; tokens: number; costUSD: number }[]; metric: Metric }) {
  const total = rows.reduce((s, r) => s + r[metric], 0) || 1;
  return (
    <table class="w-full text-sm">
      <thead class="text-left text-xs uppercase text-gray-500">
        <tr><th class="py-2">Name</th><th class="py-2 text-right">{metric === 'costUSD' ? 'Cost' : 'Tokens'}</th><th class="py-2 w-1/3">Share</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.label} class="border-t border-gray-100 dark:border-dark-border">
            <td class="py-2 font-mono">{r.label}</td>
            <td class="py-2 text-right font-mono">{fmtVal(metric, r[metric])}</td>
            <td class="py-2">
              <div class="h-2 rounded bg-gray-100 dark:bg-dark-surface">
                <div class="h-2 rounded bg-blue-500" style={{ width: `${(r[metric] / total) * 100}%` }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Dashboard({ daily, breakdown }: Props) {
  const [range,  setRange]  = useState<Range>('all');
  const [metric, setMetric] = useState<Metric>('tokens');
  const [view,   setView]   = useState<View>('overview');

  const filtered = useMemo(() => filterByRange(daily, range), [daily, range]);

  const rangeBtn = (r: Range, label: string) => (
    <button
      onClick={() => setRange(r)}
      class={`rounded-md px-3 py-1 text-sm ${range === r ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-300 dark:border-dark-border'}`}
    >{label}</button>
  );
  const viewBtn = (v: View, label: string) => (
    <button
      onClick={() => setView(v)}
      class={`rounded-md px-3 py-1 text-sm ${view === v ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-300 dark:border-dark-border'}`}
    >{label}</button>
  );

  const breakdownRows = useMemo(() => {
    switch (view) {
      case 'tool':     return breakdown.byTool.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
      case 'provider': return breakdown.byProvider.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
      case 'model':    return breakdown.byModel.map(r => ({ label: `${r.label} (${r.tool})`, tokens: r.tokens, costUSD: r.costUSD }));
      case 'project':  return breakdown.byProject.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
      default: return [];
    }
  }, [view, breakdown]);

  return (
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-2">{rangeBtn('all', 'All')}{rangeBtn('30d', '30d')}{rangeBtn('7d', '7d')}</div>
        <div class="flex gap-2">
          {viewBtn('overview', 'Overview')}{viewBtn('tool', 'By Tool')}{viewBtn('provider', 'By Provider')}{viewBtn('model', 'By Model')}{viewBtn('project', 'Projects')}
        </div>
        <div class="flex gap-2">
          <button onClick={() => setMetric('tokens')}
            class={`rounded-md px-3 py-1 text-sm ${metric === 'tokens' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-300 dark:border-dark-border'}`}>Tokens</button>
          <button onClick={() => setMetric('costUSD')}
            class={`rounded-md px-3 py-1 text-sm ${metric === 'costUSD' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-300 dark:border-dark-border'}`}>Cost</button>
        </div>
      </div>

      <Heatmap daily={filtered} metric={metric} />

      {view !== 'overview' && (
        <div class="rounded-lg border border-gray-200 p-4 dark:border-dark-border">
          <BreakdownTable rows={breakdownRows} metric={metric} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire into the page**

Modify `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro` to import and mount Dashboard with `client:load`. Place between StatsGrid and MobyDickFooter.

```astro
---
import BaseLayout from '@/layouts/Base.astro';
import { getEntry } from 'astro:content';
import StatsGrid from '@/components/tokenmaxing/StatsGrid.astro';
import StaleBadge from '@/components/tokenmaxing/StaleBadge.astro';
import MobyDickFooter from '@/components/tokenmaxing/MobyDickFooter.astro';
import Dashboard from '@/components/tokenmaxing/Dashboard.tsx';

const entry = await getEntry('tokenmaxing', 'current');
const data = entry?.data;
---
<BaseLayout title="Tokenmaxing | Nick Nisi" description="Weekly stats on my AI coding-agent usage and public PRs.">
  <section class="mx-auto max-w-6xl px-6 py-12">
    <header class="mb-8">
      <h1 class="font-serif text-4xl font-bold tracking-tight md:text-5xl">Tokenmaxing</h1>
      {data ? (
        <p class="mt-3 text-gray-600 dark:text-gray-400">
          {data.period.from} → {data.period.to} · last updated{' '}
          <time datetime={data.generatedAt}>
            {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </time>
          {' '}<StaleBadge generatedAt={data.generatedAt} />
        </p>
      ) : (
        <p class="mt-3 text-gray-600 dark:text-gray-400">Data feed offline — refreshes weekly.</p>
      )}
    </header>

    {data && (
      <>
        <StatsGrid summary={data.summary} />
        <div class="mt-8">
          <Dashboard
            client:load
            daily={data.daily}
            breakdown={{
              byTool: data.byTool,
              byProvider: data.byProvider,
              byModel: data.byModel,
              byProject: data.byProject,
            }}
          />
        </div>
        <MobyDickFooter totalTokens={data.summary.totalTokens} />
      </>
    )}
  </section>
</BaseLayout>
```

- [ ] **Step 3: Run dev server, exercise the controls**

Run: `cd ~/Developer/nicknisi.com && pnpm dev`
Visit: `http://localhost:8080/tokenmaxing`
Verify: range toggles refilter heatmap; metric toggle re-shades it; view tabs switch breakdown table; Overview shows just heatmap.
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/nicknisi.com && git add src/components/tokenmaxing/Dashboard.tsx src/pages/tokenmaxing.astro && git commit -m "feat(tokenmaxing): interactive dashboard island (heatmap + breakdown tabs)"
```

---

## Task 16: Weekly highlights section

**Files:**
- Create: `~/Developer/nicknisi.com/src/components/tokenmaxing/WeeklyHighlights.astro`
- Modify: `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro`

- [ ] **Step 1: Write `WeeklyHighlights.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  weeks: CollectionEntry<'tokenmaxing'>['data']['weeklyHighlights'];
}
const { weeks } = Astro.props;

const stateBadge = {
  merged: { cls: 'bg-purple-200 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200', label: 'merged' },
  open:   { cls: 'bg-green-200 text-green-900 dark:bg-green-900/40 dark:text-green-200', label: 'open' },
  closed: { cls: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'closed' },
};
---

<section class="mt-12 space-y-8">
  <h2 class="font-serif text-2xl font-semibold">Weekly Highlights</h2>
  {weeks.length === 0 && (
    <p class="text-gray-500 dark:text-gray-400">No public PRs in this period.</p>
  )}
  {weeks.map(w => (
    <div>
      <h3 class="mb-3 font-mono text-sm uppercase text-gray-500 dark:text-gray-400">
        Week of {w.weekEnding}
      </h3>
      <ul class="space-y-2">
        {w.pullRequests.map(pr => (
          <li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-100 py-2 dark:border-dark-border">
            <span class={`rounded px-2 py-0.5 text-xs font-medium ${stateBadge[pr.state].cls}`}>{stateBadge[pr.state].label}</span>
            <a href={pr.url} class="font-mono text-sm hover:underline">{pr.repo}#{pr.number}</a>
            <span class="text-gray-700 dark:text-gray-300">{pr.title}</span>
            <span class="ml-auto font-mono text-xs">
              <span class="text-green-700 dark:text-green-400">+{pr.additions}</span>{' '}
              <span class="text-red-700 dark:text-red-400">-{pr.deletions}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  ))}
</section>
```

- [ ] **Step 2: Mount in the page**

Modify `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro` — add the import and render between `<Dashboard …/>` and `<MobyDickFooter …/>`:

```astro
import WeeklyHighlights from '@/components/tokenmaxing/WeeklyHighlights.astro';
```

```astro
<WeeklyHighlights weeks={data.weeklyHighlights} />
```

- [ ] **Step 3: Run dev server, eyeball**

Run: `cd ~/Developer/nicknisi.com && pnpm dev`
Visit: `/tokenmaxing`. Verify weeks render in reverse-chronological order, PRs sorted biggest first, all links work.
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd ~/Developer/nicknisi.com && git add src/components/tokenmaxing/WeeklyHighlights.astro src/pages/tokenmaxing.astro && git commit -m "feat(tokenmaxing): weekly highlights with PR list"
```

---

## Task 17: Polish + ship

**Files:**
- Modify: `~/Developer/nicknisi.com/src/pages/tokenmaxing.astro` (no-data empty state already present; add subtle copy improvements)
- Modify: `~/Developer/nicknisi.com/src/components/Header.astro` (or wherever site nav lives) to add `/tokenmaxing` link

- [ ] **Step 1: Verify nav location**

Run: `grep -rn 'about\|posts\|speaking' /Users/nicknisi/Developer/nicknisi.com/src/components/Header.astro 2>/dev/null | head`

Identify the nav links list. If `Header.astro` is the file, add a new link there alongside the existing ones. If nav lives elsewhere, locate it via `grep -rn '/about' src/components`.

- [ ] **Step 2: Add nav link**

In the nav array/list, add a `Tokenmaxing` entry with href `/tokenmaxing`. Match the existing pattern; do not invent a new component shape. Example for an array-driven Header:

```astro
const navLinks = [
  // ...existing...
  { href: '/tokenmaxing', label: 'Tokenmaxing' },
];
```

(If the nav is hand-coded JSX, append a matching `<a>` element.)

- [ ] **Step 3: Run typecheck + build**

Run: `cd ~/Developer/nicknisi.com && pnpm run typecheck && pnpm build`
Expected: typecheck clean; build completes; `dist/tokenmaxing/index.html` exists.

- [ ] **Step 4: Sanity-render the built page**

Run: `cd ~/Developer/nicknisi.com && pnpm preview`
Visit: `http://localhost:8788/tokenmaxing` (Wrangler default). Verify the static page renders with real data and the React island hydrates.
Stop the preview.

- [ ] **Step 5: Commit and push**

```bash
cd ~/Developer/nicknisi.com && git add -A && git commit -m "feat(tokenmaxing): add nav link + polish"
git push origin main
```

Cloudflare Pages auto-deploys. Visit `https://nicknisi.com/tokenmaxing` once the build completes.

- [ ] **Step 6: First production publish from generator**

Run: `cd ~/Developer/tokenmaxing && bun run publish`
Expected: gist updated; deploy hook returns 200; another Cloudflare build kicks off; site rebuilds with the latest data.

---

## Task 18: Schedule the weekly publish

Pick one mechanism. The user mentioned a Claude scheduled task as a preference; cron is the no-dependency fallback.

- [ ] **Step 1 (Option A — launchd):** Create `~/Library/LaunchAgents/com.nicknisi.tokenmaxing.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.nicknisi.tokenmaxing</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-l</string>
    <string>-c</string>
    <string>cd ~/Developer/tokenmaxing && bun run publish >> ~/.cache/tokenmaxing.log 2>&1</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>1</integer>
    <key>Hour</key><integer>8</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
```

Run: `launchctl load ~/Library/LaunchAgents/com.nicknisi.tokenmaxing.plist`
Verify: `launchctl list | grep tokenmaxing` — entry present.

- [ ] **Step 1 (Option B — Claude scheduled task):**

Use the schedule skill (`/schedule`) to create a routine: prompt `cd ~/Developer/tokenmaxing && bun run publish`; cron `0 13 * * 1` (8 AM Chicago).

- [ ] **Step 2: Confirm it ran**

After the next scheduled fire, check `~/.cache/tokenmaxing.log` (option A) or the schedule history (option B) for a successful run. Cross-check by visiting the published gist.

---

# Self-Review Checklist (the plan author runs this; not a separate task)

**1. Spec coverage** — every section of the spec has a task:
- §2 Architecture → Tasks 1, 13 (overall scaffolding)
- §3.1 Generator repo → Tasks 1–11
- §3.2 Consumer repo → Tasks 13–17
- §4 Data Contract → Task 1 (types), Task 13 (zod schema)
- §5.1–5.7 Generator details → Tasks 1–11
- §6.1 Loader → Task 13
- §6.2 Collection → Task 13
- §6.3 Page → Tasks 14–17
- §6.4 Moby-Dick → Task 14
- §7 Update flow → Tasks 10, 12, 17, 18
- §8 Privacy & secrets → Tasks 9, 12 (config + first-run review)
- §9 Out of scope → not implemented (correct)
- §10 Open questions → Task 6 (codex path verification), Task 12 (pricing review on first publish)

**2. Placeholder scan** — searched for "TBD", "TODO", "fill in", "implement later", "similar to". None present.

**3. Type consistency** — `TokenmaxingData`/`UsageEvent`/`PullRequest`/`ToolId` shapes used identically across `types.ts`, `aggregate.ts`, `index.ts`, and the consumer's zod schema. `ToolId` enum values match: `'claude-code' | 'pi' | 'codex'`.

**4. Cross-task references** — every function/type called in a later task is defined in an earlier task: `parseClaudeCode` (T4), `parsePi` (T5), `parseCodex` (T6), `fetchPullRequests` (T7), `aggregate` (T8), `loadConfig` (T9), `writeGist`/`readGist`/`triggerDeploy` (T10), `tokenmaxingLoader` (T13), `Dashboard` (T15).

---

# Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-28-tokenmaxing.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using `executing-plans`, batch execution with checkpoints for review.

Which approach?
