---
title: 'Git: Update a forked repository'
slug: 2014-08-24-git-update-fork
pubDate: 2014-08-24
tags:
  - dotfiles
  - git
---

Github is great! It is so easy to fork a project, push up some commits, and then send a pull request upstream. After a while, those forks can get behind the source repository, making it difficult to submit a new pull request later on. One thought might be to delete the fork and then re-fork the project, but there is an easier way!

## Syncing a fork

Syncing a fork is easy to do from the command line. With a clone of the fork, we can create a new remote that points to source repository on Github.

```bash
$> git remote add upstream git@github.com:theintern/intern.git
```

This will add a new remote named `upstream`, which points to the source repository. Next, fetch the latest from the upstream repository.

```bash
$> git fetch upstream
```

Then, apply the upstream changes to our local copy of master (or whatever branch you are on).

```bash
$> git rebase upstream/master
```

At this point, the local copy of our branch has now been updated with the latest code from the usptream repository, meaning that we are now up today. Finally, we just need to push these changes up to our `origin` remote.

```bash
$> git push origin master
```

That's it! We have now successfully updated our fork of a project without having to delete the repository and start over.

## But that's so many steps...

It can be difficult to remember all of the commands needed for git actions. Luckily, git gives us a way to configure aliases to common or complex actions. Using this and a little convention, we can make a nice alias to reduce the steps above to a single step. Git makes it easy to set up as many remotes as we need, so we can easily pull from an `upstream` remote and then update our `origin` remote.To make a command that can work in any repository, we need to follow a few conventions when it comes to naming our remotes.

- `origin` - The main repository to push to (our fork)
- `upstream` The main project repository

This way, the alias knows which remote to fetch, and which remote to push to. With this convention in place, we can create an alias in our `~/.gitonfig`:

```bash
[alias]
	update = !git fetch upstream && git rebase upstream/master
```

This works great, except that it always assumes that we only want to update the `master` branch, which isn't ideal. There is a way to get the current branch that we have checked out from a simple command.

```bash
$> git rev-parse --abbrev-ref HEAD
```

![Git find current branch name](@/assets/posts/git-current-branch.png)

Using this within the alias gives us a great shortcut to updating `origin` with the latest from the `upstream` remote.

```bash
[alias]
    update = !git fetch upstream && git rebase upstream/`git rev-parse --abbrev-ref HEAD`
```

This condenses the number of steps down to two:

1. `git update` to update our local branch with the latest from the `upstream` remote
1. `git push` to push those changes up to the `origin` remote, updating the fork

Aliases are a great way to condense complex actions down to simple commands or to reduce the amount of typing required to execute a command. For more awesome git aliases, check out my [`.gitconfig`](https://github.com/nicknisi/dotfiles/blob/master/git/gitconfig.symlink).

![git update usage](@/assets/posts/git-update.gif)
