---
title: 'Ideation: Because Planning Needs More Than a Mode'
pubDate: 2026-02-14
description: "Claude Code's plan mode is a great starting point for thinking before coding. But for complex work, I needed more than a mode. I needed a system. Here's what I built."
hero:
  img: '@/assets/posts/ideation.png'
  alt: 'Ideation teaches AI to plan before it codes'
  darkOverlay: true
tags:
  - ai
  - claude-code
  - workflow
  - planning
  - plugins
---

AI can write the code. That part's easy now.

But before you can write code, you need to know what you're building. And that's where I keep getting stuck. I have scratch files full of half-formed ideas, voice memos I never revisit, shower thoughts that never make it past "that would be cool." The ideas aren't the problem. Turning them into something specific enough to act on is.

## Plan Mode Is a Good Start

Claude Code has a built-in [plan mode](https://code.claude.com/docs/en/common-workflows#how-to-use-plan-mode). Hit Shift+Tab, describe what you want, and Claude explores the codebase read-only before proposing an approach. For a focused task like "refactor this module" or "add OAuth2 support," plan mode gives you a solid starting point before any code gets written.

But plan mode lives inside a single session. The plan exists in conversation context. It doesn't produce artifacts you can review later, share with teammates, or hand off to a different session. There's no structured process for figuring out whether Claude actually _understands_ the problem well enough to plan. And when the work spans multiple phases, there's nothing to carry forward.

For small tasks, that's fine. For the kind of work that stalls in the planning phase for days (the ambitious features, the multi-phase refactors, the ideas that start as shower thoughts) I needed something with more rigor.

## From Mode to System

That's what led me to build the [Ideation](https://github.com/nicknisi/claude-plugins) skill for Claude Code. Where plan mode is a toggle, Ideation is a pipeline.

You start by dumping whatever's in your head. Voice dictation, scattered bullet points, contradictions and all. The mess is the input. But instead of immediately organizing that mess into a plan, Ideation does something I got wrong in early versions: it scores its own confidence first.

Five dimensions (problem clarity, goal definition, success criteria, scope boundaries, internal consistency), each scored 0 to 20. The threshold to proceed is 95 out of 100.

That's deliberately high. When the score falls short, and it almost always does on the first pass, the skill asks targeted clarifying questions. Structured questions with concrete options: _"Should this be scoped to a single language for v1, or support multiple from the start?"_

One extra round of questions costs minutes. A bad plan costs hours.

## The Full Pipeline

Let me walk through what actually happens, using a real project.

I had scattered thoughts about a problem with our AI coding agent in the [WorkOS CLI](https://github.com/workos/cli). It runs once, writes code, and then terminates. Validation happens after. When it catches real issues (wrong file placement, build failures), those results go to the user, not back to the agent. The agent never gets a chance to fix its own mistakes.

I rambled about this into `/ideation`.

### Codebase First

Before asking me anything, Ideation explored the existing codebase: the project structure, the validation module, the agent runner, the event emitter patterns, the test infrastructure. That context feeds into every artifact. Specs reference real file paths and existing patterns ("Pattern to follow: `src/lib/validation/build-validator.ts`"). Code that ignores existing conventions sticks out. Ideation reads first.

### Contract

After exploration, Ideation scored its confidence at around 80, asked me a few clarifying questions about scope and retry limits, and on the second pass hit 95%. Then it generated a **contract**:

> **Problem Statement**: The CLI runs its coding agent as a single-shot operation. The agent writes code, then validation runs after the agent has already terminated. When validation catches real issues, the results go to the user, not back to the agent. The agent never gets a chance to fix its own mistakes.
>
> **Goals**:
>
> 1. When validation catches fixable issues, feed them back to the agent for a second attempt within the same session, capped at 2 retries
> 2. Run fast deterministic checks (typecheck, lint) during agent execution, catching errors earlier and saving tokens
> 3. Refactor retry and validation logic into well-separated functions so the orchestration is understandable

The contract also pinned down scope boundaries (what's in, what's out, what's deferred), testable success criteria, and future considerations. From a few minutes of rambling to a document I could review, share with the team, and sit on before building anything.

### PRDs or Straight to Specs

After I approved the contract, Ideation asked how to proceed: generate PRDs (Product Requirements Documents) for each phase, or go straight to implementation specs.

PRDs are useful when you need buy-in. If the work involves other teams, stakeholders, or cross-functional review, PRDs add a requirements layer with user stories, functional requirements, and acceptance criteria. They're the artifact you hand to someone who needs to approve the _what_ before you get into the _how_.

For this project I went straight to specs, but for our `workos doctor` diagnostic CLI (which involved the support team), I used the PRD path. That project generated 26 functional requirements organized by feature area before a single spec was written.

### Phases and Specs

Ideation broke the resilience work into three phases based on dependencies:

1. **Restructure validation** into composable steps so fast checks can run independently
2. **Add the retry loop** that feeds validation failures back to the agent within the same session
3. **Update evals** to use the production retry pipeline so we can measure the impact

Each phase became its own implementation spec. Specs are detailed: technical approach, every file to create or modify, code snippets showing the target patterns, testing requirements, error handling strategies, and validation commands you can copy-paste to verify the work.

For projects where 3+ phases follow the same structure (like adding SDK support for multiple languages), Ideation generates one full template spec and lightweight per-phase deltas instead of duplicating the whole thing N times. Smaller projects that only touch a few files skip phasing entirely and get a single `spec.md`.

### Feedback Loops

This is the part I think matters most. Each spec includes per-component [feedback loops](https://ampcode.com/notes/feedback-loopable): a playground, an experiment, and a fast check command. Whoever picks up the spec (human or agent) can verify their work _during_ implementation.

The feedback mechanism matches the component type. Data layers get test files. UI components get a dev server or Storybook. API endpoints get curl scripts. Config and type changes skip feedback loops entirely since typecheck covers them.

Phase 1's quick-checks module defined its loop like this:

- **Playground**: A test file with fixture paths for projects with intentional type errors
- **Experiment**: Test with a clean project (all pass), a project with a type error (typecheck fails, build skipped), and a project with no `tsc` available (fallback)
- **Check command**: `pnpm test src/lib/validation/quick-checks`

Before presenting any spec, Ideation self-reviews feedback loop quality. If iterative components are missing loops, it revises the spec before showing it to you.

Each phase also ends with checkpoint criteria: specific behaviors to verify before moving on. Phase 2 can't start until Phase 1's checkpoints pass.

### Execution

The specs live as markdown files in `docs/ideation/`. When it's time to build, I run `/execute-spec` in a fresh Claude Code session. It reads the spec and explores the codebase for relevant patterns. Then it creates granular tasks with dependencies, sets up the feedback environment, and starts building. After each component it runs the check command. Clean context, continuous validation, no stale conversation history from the planning phase.

`/execute-spec` without arguments auto-detects the next unblocked phase across sessions, so you can `/clear` and `/execute-spec` repeatedly as you work through phases.

When phases are independent, Ideation analyzes the dependency graph to figure out which ones can run concurrently. It also detects shared files across specs that could cause merge conflicts. Then it generates a ready-to-paste prompt for [agent teams](https://code.claude.com/docs/en/agent-teams). You paste it into a fresh session in delegate mode, and the lead spawns teammates, each with their assigned spec and plan approval required. For parallelism _within_ a single phase, `/execute-spec --parallel` spawns subagents for independent components.

## When to Use Plan Mode vs. Ideation

This comes down to how well-formed your idea is.

**Use plan mode** when you have a clear task. "Refactor the auth module." "Add pagination to the API." You know what you want, you just want Claude to think before coding. Plan mode explores, proposes, and executes in one session.

**Use Ideation** when you have scattered thoughts instead of a clear task. When you're not sure what's in scope. When the work will span multiple sessions or phases. When you want the AI to prove it understands the problem before it starts planning. Or when you need reviewable artifacts (contracts, PRDs, specs) to share with others before writing code.

Ideation produces portable files that survive beyond a single conversation. Review them with your team, sit on them for a week, or hand them to `/execute-spec` whenever you're ready.

I've used it on four projects so far. Each started as messy thoughts. Each produced artifacts that I handed off to fresh sessions for clean-context execution. The projects that would have stalled in the "I should build that" phase are actually getting built.

## Try It

```
npx skills add nicknisi/claude-plugins
```

Then type `/ideation` and start rambling. The mess is the input.

The code writes itself now. Ideation makes sure you know what to write.
