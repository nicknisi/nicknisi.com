# Working file — inside-the-harness redraft

Claim → source ledger plus pinned verbatim material. This file is the
`--source` input to `slopcheck.ts`. Everything under "Pinned verbatim" is
Nick's own words or an exact record, verified against the named source.
Interview answers get appended at the bottom as they arrive.

## Pinned verbatim — Nick's words and exact records

### Zack thread, #pi, 2026-07-20 (Slack, message_ts 1784592197.548199)

Zack Proser (19:03 CDT):
> Why did @nicknisi say he no longer thinks pi is a good idea before I get any deeper into it?

Nick, reply 1 (ts 1784592942.113579):
> Haha I merely said that there's real innovation in harnesses that shouldn't be ignored!

Nick, reply 2 (ts 1784592964.547509):
> Love pi though! :homer-disappear:

Zack:
> WHAT DO YOU MEAN MAN

### March 18, 2026 (Slack #pi + session logs)

Nick, 14:36 CDT (Slack):
> lol, love that this is also Pi's domain: https://shittycodingagent.ai/

Pi session starting 20:07:55Z (= 3:07pm CDT), workos-node repo, contains Nick's prompt:
> what can pi do

Pi session starting 20:27:49Z (= 3:27pm CDT), dotfiles repo, contains Nick's prompt:
> recreate this for pi

### August 3, 2026, #pi thread (Slack, message_ts 1785773231.346419)

Nick, 11:07 CDT:
> Anyone have their pi configs open source? I'd love to scour them!

Nick, follow-up:
> Here's mine: https://github.com/nicknisi/dotfiles/tree/main/home/.pi

Nick, in-thread:
> I am so curious about your workflow

Nick, in-thread:
> my perception is I should be thinking about subagents differently in pi and I'm still thinking about them from a claude perspective

Nick, in-thread:
> pi-intercom?

Nick, in-thread:
> I saw you forked it. Any secret sauce in your fork?

Nick, quoting Mitch then asking:
> > subagents and inter-agent comms are the secret sauce
> can you elaborate? Like how do you approach the interagent comms part?

### August 1, 2026 prompt (from the published post's blockquote)

> so far I've been using pi like i've been using claude code. I know I can go deeper and make things better with pi, but I'm not sure exactly how. What are the capabilities beyond a simple claude code-like coding harness?

[unverified against session log directly — quoted from the published post; Nick confirm]

## Claim → source ledger (verified 2026-08-23 session)

| Claim | Source |
| --- | --- |
| 53 files changed, 25 insertions, 25,635 deletions | dotfiles commit `0e39074` shortstat |
| Move happened Aug 6, session started 10:36am CDT | session file `2026-08-06T15-36-14Z` in dotfiles sessions dir; commit landed 13:23 CDT |
| Fleet cutover commit `feat: cut tmux + Claude Code over to fleet` on Fleet post's publish day | dotfiles commit `e5b47b6` (2026-05-28) = fleet.mdx pubDate |
| Pi commits by month Mar–Jul: 19, 2, 5, 1, 4 | `git log` on `home/.pi*` paths, per month |
| Statusline extension = 519 lines of TypeScript | file at pi-extensions pub-date commit `ccff6ab` |
| 26 packages in the monorepo at publish | pi-extensions commit `ccff6ab` (2026-08-10) |
| trust.json was committed to the public dotfiles repo | commit `94fcef9 chore(pi): stop tracking trust.json` |
| Mar 18–19 evening commits: statusline (`085af4a`), tmux status (`aa78659`), night owl theme (`fbcc73b`), spinner verbs (`4100966`) | dotfiles git log |
| March 18, 2026 was a Wednesday | calendar |
| ~50ms capture-pane cost | fleet.mdx (Nick's own post) |
| capture-pane fuses three signals, none trustworthy alone | fleet.mdx |

### Method-dependent numbers (Nick confirm, not independently reproducible)

- 188 pi sessions in ten days / 17 Claude Code sessions
- 58 sessions on Aug 3 (naive UTC file count gives 70)
- Monthly session table: 111 / 17 / 29 / 2 / 0 (pi), ~1,200 / ~590 / ~535 / ~400 / ~710 (CC)
- ~2,600 lines of broken code; 18-agent research workflow; 400× (research session output)
- 32,847 lines of TypeScript (repo shows 32,855–33,009 near publish)

## Interview answers (verbatim, appended as they arrive)

### Q1 — the failure scene (pi session cost you something your tooling couldn't see)

> sometimes pi gets stuck on things, especially if I'm closing my laptop/switching networks, etc. This has cost me more than once hours where I think it's working but it's actually doing nothing

Follow-up (the time it stung most):

> I was building a weekend project, hoping to get it presented at work the following monday. It worked all weekend, or so I thought. In the end, I was able to present it but it wasn't as robust as I had hoped.

### Q2 — the Zack dodge (what was actually in your head)

> I was just skeptical that issues like this were my fault and it would take an investment in making sure the tools work, which ended up being the case. Still at the time I wasn't ready to make that investment and I just wanted to get things done. I think that's a big dichotomy when you're working on these tools. You need to show that they work but you also need to constantly improve and make your workflows better and you're constantly thinking about both of them

### Q3 — the skeptic's case (why the bet was right even if pi dies)

> because I learned to go beyond what the big AI companies are doing. There's so much innovation at the harness level and I have learned so much. That alone is worth it, even if it goes away tomorrow.

### Q4 — anything you miss from the 25,635 deleted lines

> Not at all. I feel more productive than ever and I'm having more fun than ever

### Q5 — the day-two extension (recovered from the record; Nick couldn't recall)

Nick's prompts, pi session 2026-03-19T13:47Z (8:47am CDT), dotfiles repo (verbatim from session log):

> Can you execute commands in skills? Read this tweet to see what I mean: https://x.com/lydiahallie/status/2034337963820327017?s=46

> do it

Nick in Slack, same morning 9:04am CDT (thread ts 1773919169.669039, reply ts 1773929053.742539):

> I asked pi if pi could do this too and it made an extension :exploding_head: https://github.com/nicknisi/dotfiles/blob/pi-agent-setup/home/.pi/agent/extensions/dynamic-skills.ts

Facts: the extension is `dynamic-skills.ts` — Claude Code-style !`command` support in pi skills (shell commands in SKILL.md executed at invocation, output inlined). Commit `6414b14 feat: add dynamic skills extension - run commands in skills`. Thread started 6:19am CDT with Nick posting Lydia Hallie's tweet; reactions on the reveal: yes-yes, singularity. Cross-posted to #pi 9:15am.

**Correction to the published post:** it says "Day two, I asked pi whether it could write its own extensions. It wrote one. I posted the result in Slack with a single 🤯." The record: the ask was Claude-parity on a specific feature from a tweet ("Can you execute commands in skills?" → "do it"), and the Slack post was a full sentence with the 🤯, not a bare emoji.
