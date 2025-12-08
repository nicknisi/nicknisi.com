---
title: Very Important Agents
slug: 'very-important-agents'
pubDate: 2025-12-08
tags: ['ai', 'claude-code', 'workflow', 'podcasts']
description: 'My recent Changelog and Friends podcast appearance and the Claude Code plugins that help me get real work done with AI.'
post: 'https://bsky.app/profile/nicknisi.com/post/3m7i3ygaets2v'
---

I recently appeared on [Changelog and Friends](https://changelog.com/friends/120) to talk about agents, the Bun acquisition by Anthropic, and how I've been using Claude Code in my daily workflow. The conversation kept circling back to a question I find interesting: how do we use AI to get real work done without producing generic _slop_?

I've been building toward an answer - two custom Claude Code plugins called [Essentials](https://github.com/nicknisi/claude-plugins/tree/main/plugins/essentials) and [Ideation](https://github.com/nicknisi/claude-plugins/tree/main/plugins/ideation) that help me stay productive while keeping my code and ideas authentically mine. Rather than let that podcast conversation disappear into the archives, I wanted to share what I've learned.

## Keeping Code Clean with [Essentials](https://github.com/nicknisi/claude-plugins/tree/main/plugins/essentials)

The Essentials plugin is my first line of defense against code complexity. It has two components I reach for constantly.

**[Code Simplifier](https://github.com/nicknisi/claude-plugins/blob/main/plugins/essentials/agents/code-simplifier.md)** is an agent that refactors code to improve readability without changing functionality. I recently used it on a nested callback situation that had grown organically over several iterations. You know the type - it started simple, then requirements changed, then edge cases appeared, and suddenly you're staring at something that works but makes your brain hurt. The agent untangled it into something I could actually follow. Same behavior, less cognitive load.

**[de-slopify](https://github.com/nicknisi/claude-plugins/blob/main/plugins/essentials/commands/de-slopify.md)** is a command that removes AI-generated patterns from code. After running Claude on a feature, I sometimes notice overly verbose comments, unnecessary abstractions, or redundant explanations that scream "an AI wrote this." de-slopify catches these patterns and strips them out. The result is code that looks like a human wrote it - because the important parts are still mine, just without the AI fingerprints.

This might seem contradictory. Using AI to remove evidence of AI? But that's exactly the point. I want AI assistance with the mechanics, not AI aesthetics polluting my codebase.

## From Brain Dump to Structure with [Ideation](https://github.com/nicknisi/claude-plugins/tree/main/plugins/ideation)

Here's where things get meta. The [Ideation skill](https://github.com/nicknisi/claude-plugins/blob/main/plugins/ideation/skills/ideation/SKILL.md) takes messy stream-of-consciousness thoughts and transforms them into structured artifacts.

I'm literally using this plugin right now to write this post.

That's not a hypothetical. It's the truth.

My process started with a voice dictation where I rambled about the podcast, what I wanted to cover, and why authenticity matters when using AI for content. Just scattered thoughts, no structure. The Ideation plugin took that brain dump and produced a contract (what I'm committing to), a PRD (what the post needs to accomplish), and a spec (how to actually write it).

The value here isn't that AI wrote my outline. It's that AI removed the blank page problem. I went from "I should write about this podcast" to having a clear structure to follow in minutes instead of days. The ideas are still mine. The organization just got easier.

## AI as Amplifier, Not Replacement

These plugins represent a philosophy I keep coming back to: AI should amplify your capabilities, not replace your judgment.

There are two problems I'm trying to solve. First, the barrier problem. I have ideas and things I want to build. But life is busy, and the gap between "I should do this" and actually having a plan is often too wide to cross. AI can lower that barrier by handling the organizational grunt work.

Second, the slop problem. AI-generated code often has a distinctive smell - overly verbose, over-abstracted, over-commented. I don't want that in my codebase. I want to use AI in a way that makes me more productive without making my code less mine.

The plugins I've built are my answer to both problems. Essentials keeps my code clean. Ideation turns chaos into structure. Each one is intentionally designed to amplify rather than replace.

The key is being intentional. Use AI for the right things. Use it in ways that lower barriers without raising slop levels. Use it as an amplifier, not a replacement.

## Try It Yourself

All of these plugins live in my [Claude plugins marketplace](https://github.com/nicknisi/claude-plugins). You can install the whole collection with a single command:

```
/plugin marketplace add nicknisi/claude-plugins
```

That gives you access to Essentials, Ideation, and a few other plugins I've been building. Browse the repo if you want to see how they work under the hood - or just install and experiment.

**Resources:**

- [Claude plugins marketplace](https://github.com/nicknisi/claude-plugins) - The full collection
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code) - Getting started with Claude Code
- [Changelog and Friends Episode 120](https://changelog.com/friends/120) - The podcast conversation that started this

Let me know how it works for you. I'm [@nicknisi.com](https://bsky.app/profile/nicknisi.com) on Bluesky.
