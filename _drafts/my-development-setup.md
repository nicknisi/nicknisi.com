---
title: My Development Setup
layout: post
---

Since December of 2011, I have been continuously improving my development environment and slowly moving more into the terminal. Since then, I have started using vim, zsh, and tmux full time.

At my previous job, I developed on a Windows box, mostly in Eclipse or Notepad++ (when not programming in Java). In my personal projects, I used TextMate on my iMac. I left this company in October of last year and joined a startup where the IDE of choice was IntelliJ Idea. I gave it a shot, but it seemed overly complicated and clunky (much like Eclipse). It didn't feel like home.

I switched to Sublime Text 2 and really enjoyed it. It is a beautiful editor. Adding plugins to it was a cinch Sublime Package Control. It's with this editor that I started thinking about syncing the configuration between my computers. I use a Macbook Pro at work and have a personal iMac and Macbook Air. I created a sublimetext-settings git repo to sync the ST2 User directory and that seemed to work pretty well. Alas, it still didn't feel like home.

This is when I decided to give vim a try. I used vim all through college, but never learned more than enough to open a single file, get into insert mode, leave insert mode, save, and quit. I used the arrow keys and never touched the pretty vanilla .vimrc that one of my professors handed out.

This time around, I decided to focus on pimping out the vimrc. I know a lot of people will recommend against this, but there was some funcitonality that I needed to confirm were feasible before I could switch to vim full time. I needed to

+ be able to quickly open a file using a fuzzy find
+ have a decent file browser

I spent a couple hours browsing vimrcs I found on Github and started to create my own from what I found. I made sure that I understood everything I was adding to the vimrc, often testing out the setting and reaading the :help before settling on additions. Then I started looking at plugins to accomplish the above tasks. I quickly stumbled upon Tim Pope's Pathogen plugin, which made trying out plugins a breeeze.

#### Fuzzy Finding

I tried a plugin called [vim-fuzzyfinder](http://www.vim.org/scripts/script.php?script_id=1984), but seemed a little clunky and slow opening files in my project. I should point out that the project I work on at my day job isn't terribly huge, and is split between two git repos. I may have given up on this plugin a little too soon, as it could probably be configured to be more performant by ignoring files and such.

I looked at [CommandT](https://wincent.com/products/command-t), but didn't like the requirement to have ruby support enabled in vim.

Finally, I stumbled onto [ctrlP](https://github.com/kien/ctrlp.vim). It is written in pure VimL and is fast

------

## vim

### Plugins

## tmux

## zsh