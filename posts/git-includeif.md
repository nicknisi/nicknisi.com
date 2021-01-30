---
title: "Git Your Way: includeIf"
date: 2021-01-30
description: "Implement finer control of your Git configuration."
tags:
  - dotfiles
  - git
---

## The Problem

As a developer who works on many projects, including client and open source projects, I often need to be mindful of how I commit to each project. That is, company/client projects should always use my work email address when committing, and for open source I would prefer to use my personal email address. 

This can be set up on a per-project basis by simply running `git config user.email <EMAIL>` from within each project once and it will be set . The problem with this is that I actually have to remember to run this command from each project or risk accidentally committing with the wrong email address. Fortunately, git has a built-in method of helping with this. 

## The Solution

Let’s say you have the following directory structure:

```bash
|-- work
|-- oss
```

All of your work projects (where you want to use your work email in commits) is in the `./work` directory, and all of the open source is (you guessed it) in `./oss`. In your `~/.gitconfig` there is a specifier called [`includeIf`](https://git-scm.com/docs/git-config/2.15.4#_includes) that can be configured to load another git configuration file based on where the git repository lives on your file system.

```bash
# inside of ~/.gitconfig
[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig-work
[includeIf "gitdir:~/oss/"]
  path = ~/.gitconfig-oss
```

This will only source these sub-configuration files if you are working on a git repo inside of one of the specified directories. Then, inside of those config files is where you can specify work or oss-specific configuration, such as the email address to use, which will then always be used for any project within those specified directories.

```bash
# inside of ~/.gitconfig-work
[user]
  name = Nick Nisi
  email = nick@work.co
```

## How I Use It

To see this and other fun git/vim/zsh/tmux tips in action, check out my [dotfiles](https://github.com/nicknisi/dotfiles). For this specific example, I don’t actually use it directly in my dotfiles, but instead I do it in a [`~/.dotfiles-local`](https://github.com/nicknisi/dotfiles/blob/d9a4bb96139168f9f5813064445873b5fba221a7/git/gitconfig.symlink#L4-L7) file. I reference this from within my dotfiles as a way to not check-in references to my work-specific configuration.

```bash
[include]
  path = ~/.gitconfig-local
```

This will include my local configuration file and will silently ignore this line if the file doesn’t actually exist.

And that’s it! Setting this up ensures that you never accidentally commit with the wrong email address in projects, and also gives you a single place to further customize your git configuration of a project-type basis.
