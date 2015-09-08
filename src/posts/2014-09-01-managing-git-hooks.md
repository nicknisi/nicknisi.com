---
title: "Git: Managing hooks"
comments: true
tags:
  - dotfiles
  - git
published: true
type: "post"
---

Git hooks are custom scripts that can be fired off when different actions occur, and they can be run on either the client (your machine) or the server (the git remote). In this post, I'll be talking about client side hooks. The available client side hooks include `prepare-commit-msg`, `pre-commit`, `commit-msg`, `pre-rebase`, `post-merge`, and many more. These can be used to automate specific tasks like checking over the commit message before the commit is accepted to [linting your JavaScript](2012-11-12-lint-javascript-on-commit) before it can be committed. The hooks can be written in any language that the system supports, and they can be easily used within any git project, new or existing. The biggest pain point with commit hooks is managing them. They exist in of `.git/` and are not actally part of the repository.

## Setting up the hooks

The hooks are contained within the `.git/hooks`. By default, git will provide a number of sample scripts, which can be removed or renamed and modified to fit your needs.

![Default git hooks setup](/posts/images/git-hooks-default.png)

Removing the `.sample` extension from any of these files will activate them. Then, they can be modified to perform whatever task is necessary. for example, adding a file called `post-checkout` with the following will cause git to display the 5 most recent commits to the branch checked out when running `git checkout`

````bash
#!/bin/bash

echo ""
echo ""
echo -e "\033[1m RECENT COMMITS \033[0m"
git --no-pager log -n5 --graph --pretty=format:'%Cred%h%Creset %an: %s - %Creset %C(yellow)%d%Creset %Cgreen(%cr)%Creset' --abbrev-commit --date=relative
echo ""
echo ""
```

## Managing git hooks

Git hooks can be tedious to manage in multiple projects. It can be cumbersome to copy them from one project to another and to store them in a repository. Luckily, git does provide a way to simplify this. When running `git init`, git copies the sample hook scripts from a directory in to `.git/hooks`. It copies whatever is in that directory, and we can use that to copy over the hook scripts by default. To do this, change the location of `templatedir` directory in your [`~/.gitconfig`](https://github.com/nicknisi/dotfiles/blob/master/git/gitconfig.symlink#L7-L8):

```bash
[init]
    templatedir = ~/.dotfiles/git/templates
```

This way, you can manage your git hook scripts from another repository, such as your dotfiles and they wil be copied over to each new project. To add them to an existing project, just execute `git init` and they will be copied over.

![Git custom hooks setup](/posts/images/git-hooks-custom.png)

Please note that they will not overwrite files that already exist in the `.git/hooks` directory, so you will need to delete them first to completely replace them with more up-to-date scripts.

This is an easy way to get started managing git hooks in a simple, reusable way. In a later post, I will discuss further how I manage git hooks.
