---
layout: post
title: "Tools I Use: tmux"
date: 2013-06-10 21:55:22 -0500
published: true
comments: false
tags: tools tmux
---

I thought it'd be fun to post about the tools I used every day. I talk about them a lot, and at one point started writing a long blog post
covering everything. I think it'll be easier for me to actually finish it if I just post about them individually!

<img src="/img/posts/tmux-session.png" class="ri"/>

## Hello, tmux!

[tmux](http://tmux.sourceforge.net/) is a terminal multiplexer. Starting a new session creates the ability to split a terminal into multiple
windows and to split those windows into multiple vertical and horizontal panes. It is similar to [GNU
Screen](https://www.gnu.org/software/screen/), which I have not used too much before. Therefore, I won't go into differences between the two.

I started using tmux about a year ago when I switched to vim as my full-time editor. I picked up Brian Hogan's [book]((http://pragprog.com/book/bhtmux/tmux) which helped me understand the basics and gave me a default configuration to build from. Since then, I have customized key-bindings, colors, styles, and scripts, making it a powerful tool for development!

## Configuration

> Check out my [dotfiles](https://github.com/nicknisi/dotfiles/blob/master/tmux/tmux.conf.symlink) configuration for updates.

tmux has some pretty sane defaults and looks ok right out of the box. Of course, I like to configure things to be just the way I like them, so
there are a few changes I'd recommend right away.

### Change Prefix

The default prefix is set to `C-b` (or CTRL+b). This was awkward to me and in fact this is often the first thing people recommend to change.
The recommended change is to `C-a` since this is what GNU Screen has a default. I like this prefix since I remapped Caps Lock to Control. It
makes for an easy prefix to enter.

```bash
# unbind default prefix and set it to Ctrl+a
unbind C-b
set -g prefix C-a
bind C-a send-prefix
```

### Reattach to User Namespace

There are plenty of docs on how to do this, but it is
a necessity on OS X to get the native clipboard to work. For
detailed instructions, please see [ThoughtBot's](http://robots.thoughtbot.com/post/19398560514/how-to-copy-and-paste-with-tmux-on-mac-os-x) instructions.

## Customization

I wasn't a huge fan of the default style of the statusline and
colors, so I made some drastic changes. I also have added some
custom scripts which display information such as battery life
and what song is playing in Rdio or iTunes!

### The New Statusline
