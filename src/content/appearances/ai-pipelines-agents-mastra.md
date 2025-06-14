---
title: AI Pipelines & Agents in TypeScript with Mastra.ai
type: Workshop
slug: "/talks/ai-agents-mastra"
thumbnail: "@/assets/posts/ai-tooling.png"
description: Resources for my workshop on AI tooling for developers.
instances:
  - event: AI Engineer World's Fair
    location: San Francisco, CA
    date: 2025-06-03
---

# AI Pipelines & Agents in TypeScript with Mastra.ai

[Zack Proser](https://zackproser.com/) and I taught a workshop on June 3rd, 2025 at the AI Engineer World Fair in San Francisco. We showed 70+ engineers how to build AI-powered workflows using Mastra.ai and TypeScript.

## What We Built

We created an AI meme generator. You type in work frustrations. The app turns them into memes.

The workflow has four steps:

1. Extract frustrations from user input
2. Find meme templates
3. Generate captions
4. Create the final meme

## Why This Matters

Most AI tutorials stop at "call the API and print the result." We taught how to chain multiple AI tasks together. How to handle errors. How to validate data between steps.

The meme generator was fun, but the patterns are serious. You can use the same approach for:

- Customer support automation
- Data processing pipelines
- Content generation systems
- Business workflow automation

## How We Taught It

Zack and I tag-teamed the presentation. One person stayed on mic. The other helped attendees debug issues.

We structured the workshop across git branches. Each branch represented a milestone. Attendees could jump to any point if they fell behind.

The hands-on format worked. People built something real. They saw their agents complete tasks. They understood how the pieces fit together.

## What Attendees Learned

By the end, engineers could:

- Build multi-step AI workflows
- Use structured generation with schemas
- Integrate external APIs
- Test workflows locally
- Apply these patterns to real problems

Nearly everyone got the full system running. The energy in the room was incredible.

## The Mastra Advantage

Mastra lets you write AI workflows in pure TypeScript. No new DSL. No YAML configuration. Just functions and types.

You get type safety throughout your pipeline. You can test each step independently. You can compose workflows from smaller pieces.

The local development experience is excellent. Run your workflows. See the data flow. Debug when things go wrong.

## Workshop Feedback

Attendees loved the practical approach. They appreciated learning production patterns through a fun example.

People immediately started planning how to use Mastra in their own projects. That's when you know a workshop succeeded.

## Next Steps

The workshop materials are open source at [github.com/workos/mastra-agents-meme-generator](https://github.com/workos/mastra-agents-meme-generator).

Follow the guide. Build the app. Then apply the patterns to your own problems.

Start simple. Add complexity as needed. Let TypeScript guide you toward correct implementations.

Check out Zack's [write-up](https://zackproser.com/blog/ai-pipelines-and-agents-mastra) on the workshopm as well.

The future of AI development is typed, testable, and modular. Mastra makes that future accessible today.
