# Research brief — inside-the-harness redraft

Working material only. Nothing from sections 1–3 enters the draft unless Nick
reacts to it in his own words or it's a sourced fact.

## 1. State of the conversation

- [chan.dev/pi](https://chan.dev/pi) — "If Claude Code is VS Code, Pi is NeoVim." Walks the no-onboarding, RTFM experience and quotes the core pitch: "aggressive extensibility with minimal core."
- [Pi Coding Agent: The SDK Is the Real Reason to Care](https://thomas-wiegold.com/blog/pi-coding-agent/) — argues the CLI isn't the interesting part, the SDK is; pi "quietly absorbed" work he'd split across Claude Code, OpenCode, and Grok Build.
- [Why I switched from Claude Code to a Custom Coding Agent (Pi)](https://blog.esc.sh/claude-code-to-pi/) — the switching-genre template: long-time Claude Code user, growing frustration ("fighting Claude Code more and more"), switch framed as escape.
- [Understanding Pi Agent's Extension Model](https://exitcode0.net/posts/understanding-pi-agent-extension-model/) — taxonomy of context files, prompt templates, skills, TypeScript extensions; the mechanics explainer.
- [Pi Is the 'Vim of Coding Agents'](https://terminalblog.com/blog/pi-vim-of-coding-agents/) — the analogy as critique of "bloated, opinionated agents shipping from frontier labs."

## 2. The consensus take

Pi is the Neovim of coding agents: a minimal, hackable core you shape around
your workflow instead of renting an opinionated agent from a frontier lab.
Switching posts follow one arc — frustration with Claude Code (instruction
drift, lock-in, bloat), discovery of the extensible alternative, feature tour,
recommendation. The analogy carries the argument and the extension surface is
the evidence. That post has been written at least four times. It is the post to
NOT write.

## 3. Contrarian angles (each supported by Nick's material)

1. **The pitch that converts everyone else is the part that didn't move him.**
   Speed, cost, model choice, extensibility — he heard all of it in March and
   his usage still fell to zero. Support: pi commits 19 → 2 → 5 → 1 → 4
   (ledger); his own closing "The switch wasn't speed or cost or model choice."
2. **The real switching cost is the city around the old harness, not the
   harness.** The genre compares features; nobody audits their peripheral
   tooling. His Fleet/case/tmux stack only spoke Claude Code — that's what made
   pi "structurally impossible." Support: commit `0e39074` (53 files, 25,635
   deletions) as the demolition receipt.
3. **The migration tax is unlearning, not learning.** Support, his verbatim
   Slack (Aug 3): "my perception is I should be thinking about subagents
   differently in pi and I'm still thinking about them from a claude
   perspective." The switch completed when the Claude-shaped mental model
   broke, not when features were matched.

## 4. Questions only Nick can answer (these open the interview)

1. The failure scene: a specific moment a pi session cost you something —
   missed notification, lost hour, broken workflow — because Fleet/case/tmux
   couldn't see it.
2. What was actually in your head when you typed "Love pi though!" instead of
   answering Zack's question?
3. The skeptic's case: you bet your entire stack on a niche harness's
   extension API. What happens if pi changes or dies — and why was that bet
   still right?
4. Of the 25,635 deleted lines, what do you actually miss?
5. Day two, pi "wrote one" (its own extension). What exactly did it write, and
   what did the 🤯 in Slack actually mean?
