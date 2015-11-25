---
title: tmux for Presentations
comments: true
tags:
  - tmux
  - vim
published: true
type: talk
---

<iframe width="560" height="315" src="//www.youtube.com/embed/gVn1PmkcYH0" frameborder="0" allowfullscreen></iframe>

Live coding is stressful. You're often worried about making a mistake while doing it, and it seems you're set up for failure if you're trying to focus on what is being displayed on the projector while doing so. Fortunately, tmux makes it incredibly simple to attach to the same session and display one on the projector while keeping one on your local display to work around this awkwardness!

When attached to the same session, tmux will automatically resize the larger client's window to the size of the smaller client. With this in mind, make sure that the smaller client is the one displayed on the projector, or you will end up with a border around the screen. Typically, I will set the client on my local display to full screen mode to ensure that is is the larger or the two clients.

With this set up, you can simply work in either client and the changes will immediately be seen in the other! No more looking over your shoulder!

## `aggressive-resize`

We want to turn on `aggressive-resize` so that it only constrains the size of the tmux client to the size of the smaller client if both clients are looking at the same window. This setting isn't necessary for this to work, but I would still recommend it.

```bash
setw -g aggressive-resize on
```
