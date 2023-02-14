---
title: "How I take notes in Obsidian"
draft: true
date: 2022-10-16
description: "It's totally not a cult!"
tags:
  - productivity
---

This is a short write-up of how I use [Obsidian](https://obsidian.md). The note-taking methodology I try to use is a heavily-modified [Zettelkasten](https://zettelkasten.de) method, where I apply that only to the reference, literature, and permanent notes I can, but then I also apply general notes such as Daily Notes and notes that are specific to a certain task or goal. I keep them all in the same vault for easy `[[backlinking]]` with each other, and so it’s easier to try and distill atomic notes out of my every day work.

In addition to the zettelkasten side, I also try to take vigorous notes about my daily work. This includes periodic notes for each day, longer notes on projects that I'm working on (that backlink to my zettels!), and meeting notes.

## The Daily Note

The daily note is created automatically using the [Periodic Notes plugin](https://github.com/liamcain/obsidian-periodic-notes) instead of the built-in Daily-Notes plugin, along with the third-party [Calendar plugin](https://github.com/liamcain/obsidian-calendar-plugin). I use the daily note to keep track of mostly day-to-day meetings. I originally had the thought to keep individual meeting notes in their own files, but this proved to be too much effort, and I kind of like all of my meeting notes being in one file for a specific day. I heavily rely on backlinking from this file to provide temporal metadata throughout other notes. For example, if I link out to the current task note I am working on (like, _implement feature A_), then I can see in the (local) graph view on what days I was working on it, without needing to specifically maintain that metadata anywhere else.

## Project / Task Notes

For each feature I work on, I will keep track of project-specific notes in their own file. I’ll try and typically have a single file per PR, but may combine them if it makes sense. In this file, I keep track of project-specific metadata in YAML front matter. For example, I will link out to the associated Jira ticket, and provide a link to the associated OmniFocus project so I can keep track of individual tasks.

```markdown
---
jira: https://app.jira.com/browse/FUN-1234
omnifocus: omnifocus:///task/iv8m4fX4q0y
---
```

I’ll keep track of these in YAML front matter so that I can display and filter/query based on this metadata using the [dataview plugin]().

## Zettelkasten


These notes typically come from articles, books, or videos I'm consuming. For articles and books, I use the
[Readwise](https://readwise.io) service to allow me to use the Kindle/Matter highlight feature, and then those
highlights are automatically synced into my Obsidian vault via the [Official Readwise Plugin](https://github.com/readwiseio/obsidian-readwise). From there I try to break the highlights down into my own words. This helps me to get a better understanding of the thoughts represented by the highlights. Then, I try to make those thoughts into atomic notes, which are useful standalone, and no longer need to link directly to the reference material or notes. This is the process described in the book, _[How to Take Smart Notes](https://www.amazon.com/How-Take-Smart-Notes-Nonfiction/dp/1542866502)_.

![The notes flow for my zettelkasten](/img/posts/2022-10-16-notes-flow.svg)

## Plugins

- [Periodic Notes]()
- [Calendar]()
- [Dataview]()
- [Readwise Official]()
- [Jira Issue]()
- [Excalidraw]()

## Resources

- [Obsidian](https://obsidian.md)
- [Zettelkasten.de](https://zettelkasten.de)
- [How to Take Smart Notes](https://www.amazon.com/How-Take-Smart-Notes-Nonfiction/dp/1542866502)
