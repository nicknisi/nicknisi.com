---
title: Git Workshop
slug: 2013-08-18-git-workshop
pubDate: 2013-08-18
tags:
  - git
  - workshop
  - talk
---

This is the content from a talk I gave at [OMG!Code](http://code.omahamakergroup.org/) in August, 2013. I wrote it in the style of a workshop, but ended up
presenting it as a talk instead. It reads as a walkthrough and has an accompanying [git repo](https://github.com/nicknisi/git-workshop).

[@nicknisi](https://github.com/nicknisi) | [github.com/nicknisi/git-workshop](https://github.com/nicknisi/git-workshop)

## History

The original [git workshop](http://www.draconianoverlord.com/git-workshop.html)
was presented by Stephen Haberman in 2010 and covered the basics of getting
started with git.

## Prerequesites

You should have a basic understanding of how to use git for this workshop. You should
also have a free account on [Github](https://github.com) and be sure you can push to it
either by [generating an SSH key](https://help.github.com/articles/generating-ssh-keys)
or by using the [https method](https://help.github.com/articles/set-up-git).

> Do not clone or fork this repository yet. We will get to that in the *Introducing hub*
> section

## Overview

The following topics are going to be covered in this workshop:

+ [Git Branching Overview](http://pcottle.github.io/learnGitBranching/?NODEMO)
+ Teaching git about Github with hub
+ Finding bugs with bisect
+ Configuring git
+ Interactive rebase

-------

### Introducing hub

[hub](http://hub.github.com/) is a wrapper around git that teaches git about Github. hub
provides a number of shortcuts and commands that make it easier to work with git projects
hosted on Github. For example, cloning this repository is a lot simpler with hub.
Instead of typing

```bash
git clone https://github.com/nicknisi/git-workshop.git
```

to clone this repo, you just need to run

```bash
git clone nicknisi/git-workshop
```

#### Installing hub

```bash
# install on OS X
$ brew install hub

# other systems
$ curl http://hub.github.com/standalone -sLo ~/bin/hub
$ chmod +x ~/bin/hub

# alias it as git
$ alias git=hub
```

As you can see, hub wraps the git command to extend it with additional functionality. hub
makes working with github URLs a lot easier, but it does a lot more than that.

#### hub Commands

+ `git fork` - Create a fork of the repository on your Github account
+ `git pull-request` - Issue a pull request on Github without ever leaving your terminal
+ `git browse` - Open a web browser straight to the repository page on Github
+ `git create` - Create a repository out on Github from your terminal
+ ... and many more!

#### Activity: Using hub

With hub installed on your machine, create a fork of this repository, Add your name to
the CONTRIBUTERS.md file, and issue a pull request without ever leaving your terminal.

1. Clone this repository

    ```bash
    git clone nicknisi/git-workshop
    ```

1. Fork this repository to your Github account: `git fork`

    ```bash
    # This will automatically set up a new remote named `USERNAME`
    # where USERNAME is your Github username
    git fork
    ```

1. Open up the CONTRIBUTERS.md file in your favorite editor (hopefully vim) and add your name to the list
1. Commit and push up the change to your fork

    ```bash
    # USERNAME is your Github username
    git commit -a -m "added NAME to the list"`
    git push -u USERNAME master
    ```

1. Issue a pull request from the command line back to this repo

    ```bash
    # USERNAME is your Github username
    git pull-request -b nicknisi:master -h USERNAME:master
    ```

1. Open up your repo in Github to confirm your commit has been pushed up and a pull
   request has been opened

    ```bash
    git browse
    ```

### Finding bugs with `git bisect`

[bisect](https://www.kernel.org/pub/software/scm/git/docs/git-bisect.html) is a fantastic tool to help you discover the exact commit that introduced a bug into
the repository. This works by telling git bisect where a good state is: where your code
is working as expected, and where a bad state is: where the code is broken. git wil then
check out a commit in the middle, and you tell it whether this is in a good state or a
bad state. The bisect command works by performing a binary search between one commit and
another in order to find the exact commit that introduced the bug.

Performing a git bisect can be either a manual or an automatic process, and it depends on
the state of the repository and the bug that has been introduced. To perform a git
bisect, run

```bash
git bisect start
```

Then, tell bisect where a bad commit exists

```bash
git bisect bad HEAD
```

Finally, tell bisect where a good commit is

```bash
git bisect good 53cb134
```

Git will then check out a commit between these two commits and you can manually rerun
whatever steps or tests are necessary to reproduce the issue. If you can reproduce the
issue, run `git bisect bad` and `git bisect good` if you are unable to reproduce it. Git
will then pick another issue based on your response until there are no more commits left
to check. At this point, git will inform you of the commit that introduced the issue

#### Activity: Where did that bug come from?

In this activity, we are presented with a pretty simple HTML file that is supposed to display a simple square and a slider.
When the slider is changed, the square should change colors, based on the input of from the slider. At the latest commit in
the bisect branch, we are getting no JavaScript errors, and we are not seeing a slider.

We know that the code is working as intended at [37d0821](https://github.com/nicknisi/git-workshop/commit/37d0821049bd94bdc5aaa357311d4a6711d4b16d). Let's use `git bisect` to determine where things went wrong.

1. Checkout the [bisect](https://github.com/nicknisi/git-workshop/tree/bisect) branch

    ```bash
    git checkout bisect
    ```

1. Look at the *index.html* file in a browser and test the file to how it is failing
1. Look through the log to determine where the last known good state of the application is (I have marked this commit with
   the commit message "GOOD STATE")

    ```bash
    git log --graph --pretty=oneline --abbrev-commit --decorate
    ```

1. Start up bisect

    ```bash
    git bisect start
    ```

1. Alert bisect of the bad commit

    ```bash
    git bisect bad HEAD
    ```

1. Alert bisect of the good commit

    ```bash
    git bisect good 37d0821
    ```

1. git will now pick a commit between the two and check it out. Reload the page in the browser and determine if the slider
   is working properly (showing up).
    + If it is showing up, `git bisect good`
    + If it is not showing up, `git bisect bad`
1. After each command, git will checkout a new commit until it has determined the exact commit that introduced the bug
1. Once you have determined the bad commit, you should be presented with a message like this:

    ```bash
    ❯ git bisect bad                                                                                                       ✔
    9378fec...|bisect
    9378fec280242b4a02b6972c3ca9b61cdf14cad5 is the first bad commit
    commit 9378fec280242b4a02b6972c3ca9b61cdf14cad5
    Author: Nick Nisi <nick@nisi.org>
    Date:   Tue Aug 13 00:05:23 2013 -0500

        adjust animation speed slowing down again

        :100644 100644 2bf5ba28648e5c388556b37701addac90d9daf20 63ec399ce0f457bd17e5e6933a0a140c1435223d M      index.html
    ```

1. To end bisect at any time reset it

    ```bash
    git bisect reset
    ```

Following these steps, we are able to quickly determine which is the [bad
commit](https://github.com/nicknisi/git-workshop/commit/9378fec280242b4a02b6972c3ca9b61cdf14cad5).

#### Automating bisect

The process of finding a bad commit with bisect can be automated if the problem you are trying to find can be tested with a
script. Using `git bisect run`, we can provide a command or a script to execute against each commit that bisect checks. If
ths script returns 0 then the commit is considered `good`. Otherwise, it is considered `bad`. This can be really useful if
you are trying to track down what commit introduced a failing unit test or build.

### Configuring git

The configuration of git can be customized by combining actions and creating shortcuts to simplify your git workflow.

#### Advanced aliases

The [`~/.gitconfig`](https://github.com/nicknisi/dotfiles/blob/master/git/gitconfig.symlink) can include a number of custom
aliases. These can be anything from shortening simple git commands to running advanced shell scripts.

```bash
[alias]
    co = checkout
    s = status --short
    br = branch -v

    # slight variation of pretty log graph
    l = log --graph --pretty=format:'%Cred%h%Creset %an: %s - %Creset %C(yellow)%d%Creset %Cgreen(%cr)%Creset' --abbrev-commit --date=relative

    # show changed files for a commit
    cf = show --pretty="format:" --name-only

    # show what I did today
    day = "!sh -c 'git log --reverse --no-merges --branches=* --date=local --after=\"yesterday 11:59PM\" --author=\"`git config --get user.name`\"'"

    # show number of commits per contributer, sorted
    count = shortlog -sn

    # YOLO
    yolo = !git commit -am "DEAL WITH IT" && git push -f origin master && shutdown -r now "DEAL WITH IT"

    undo = reset --soft HEAD~1
    amend = commit --amend -C HEAD

    # rebase the current branch with changes from upstream remote
    update = !git fetch upstream && git rebase upstream/`git rev-parse --abbrev-ref HEAD`

    ## grep commands

    # 'diff grep'
    dg = "!sh -c 'git ls-files -m | grep $1 | xargs git diff' -"
    # 'checkout grep'
    cg = "!sh -c 'git ls-files -m | grep $1 | xargs git checkout ' -"
    # add grep
    ag = "!sh -c 'git ls-files -m -o --exclude-standard | grep $1 | xargs git add' -"
    # add all
    aa = !git ls-files -d | xargs git rm && git ls-files -m -o --exclude-standard | xargs git add
    # remove grep - Remove found files that are NOT under version control
    rg = "!sh -c 'git ls-files --others --exclude-standard | grep $1 | xargs rm' -"
```

#### Reuse recorded resolution: rerere

If you have a long-running branch, git can remember how you resolved merge conflicts and can reapply how you merged the files.

```bash
[rerere]
    enabled = true
```

#### Git hooks

Git hooks allow you to run scripts before or after events in git such as commit, push, and receive. Hooks are configured per repository and are located in the `.git/hooks` directory. Because they live in the git database directory, they are not part of your repository and can be set up independently. Here are just a few of the available commit hooks:

+ pre-commit - run before a commit to the repository
+ post-checkout - after a checkout which includes, cloning, switching branches, or resetting files
+ commit-msg - run after a commit message is entered

There are also server-side commit hooks. These can be utilized to kick off builds, run deployments, run
continuous integration, and many other things. Github has integration with third party services when
commits happen and you can also set up a route for Github to post to on certain actions.

#### Activity: Adding a commit-hook

When a new repository is created or cloned, git will copy over example commit hooks into the repository's `.git/hooks` directory:

```bash
❯ ll .git/hooks                                                                                                                   ✔ master
total 80
-rwxr-xr-x  1 nicknisi  staff   452B Jul  9 22:45 applypatch-msg.sample*
-rwxr-xr-x  1 nicknisi  staff   896B Jul  9 22:45 commit-msg.sample*
-rwxr-xr-x  1 nicknisi  staff   189B Jul  9 22:45 post-update.sample*
-rwxr-xr-x  1 nicknisi  staff   398B Jul  9 22:45 pre-applypatch.sample*
-rwxr-xr-x  1 nicknisi  staff   1.7K Jul  9 22:45 pre-commit.sample*
-rwxr-xr-x  1 nicknisi  staff   1.3K Jul  9 22:45 pre-push.sample*
-rwxr-xr-x  1 nicknisi  staff   4.8K Jul  9 22:45 pre-rebase.sample*
-rwxr-xr-x  1 nicknisi  staff   1.2K Jul  9 22:45 prepare-commit-msg.sample*
-rwxr-xr-x  1 nicknisi  staff   3.5K Jul  9 22:45 update.sample*
```

You can look at and use these files for inspriation when creating your git hook. Hooks can be written in any
language that can be called from the command line. If the script returns 0, the hook is considered successful.
Otherwise, it has failed. Let's add a git hook to show us info about our repository when we switch branches.

1. Create a file called `post-checkout` in the `.git/hooks` directory and
   execute permissions

```bash
touch .git/hooks/post-checkout
chmod +x .git/hooks/post-checkout
```

1. Set the contents of the file

```bash
#!/bin/bash

echo ""
echo ""
echo -e "\033[1m RECENT COMMITS \033[0m"
git --no-pager log -n5 --graph --pretty=format:'%Cred%h%Creset %an: %s - %Creset %C(yellow)%d%Creset %Cgreen(%cr)%Creset' --abbrev-commit --date=relative
echo "
echo ""]]"
```

1. Back in the repository, create a new branch and notice that you will get a
   summary of the last 5 commits to the repository.

```bash
git checkout -b new-branch
```

#### Managing git hooks

Git hooks are excluded from the repository and this is both a blessing and a
curse. It allows developers to setup their own hooks without affecting anyone
else. However, that means that it is typically a manual process of storing the
commit hook in a safe place and then manually copying it over into the newly
created or cloned repo.

As previously pointed out, git copies a number of *sample* commit hooks into
each repository, and we can hijack this to add our own commit hooks! These
sample files live at `/usr/share/git-core/templates` in the `hooks` directory.
We can configure git to change where this directory exists and override it
with our own defaults, allowing us to manage this directory independently and
keep under source control in our [dotfiles](http://dotfiles.github.io/).

To change where git looks for this templates directory, add the following to
your `~/.gitconfig`:

```bash
[init]
    templatedir = ~/.dotfiles/git/templates
```

Now, whenever we clone or init a new repository, we will be set up with our
own, custom git hooks that have been copied from the above path.

> Note that the hooks are copied, meaning that any revisions to them later will
> not be copied over. However, running `git init` in an existing repository
> will copy the updated hooks over to the repo.

### Interactive rebase

Remember that nasty bisect branch with its many commits changing the same thing
over and over? Wouldn't it be nice if we could clean up our log so it doesn't
look so nasty?

```bash
* fe321d9 Nick Nisi: adjust animation to 320 -   (HEAD, origin/bisect, bisect) (17 hours ago)
* 900b366 Nick Nisi: adjust animation to 319 -   (17 hours ago)
* a5ba9ac Nick Nisi: adjust animation to 318 -   (17 hours ago)
* f84b4cd Nick Nisi: adjust animation to 317 -   (17 hours ago)
* 70f7912 Nick Nisi: adjust animation to 316 -   (17 hours ago)
* 442c007 Nick Nisi: adjust animation to 314 -   (17 hours ago)
* 7fd99d5 Nick Nisi: adjust animation to 313 -   (17 hours ago)
* 507d90e Nick Nisi: adjust animation to 312 -   (17 hours ago)
* 76162b0 Nick Nisi: adjust animation to 311 -   (17 hours ago)
* 89390fa Nick Nisi: adjust animation to 310 -   (17 hours ago)
* 2f3c3fc Nick Nisi: adjust animation to 309 -   (17 hours ago)
* 18ce973 Nick Nisi: adjust animation to 308 -   (17 hours ago)
* 448e9e2 Nick Nisi: adjust animation to 307 -   (17 hours ago)
* f7a452d Nick Nisi: adjust animation to 306 -   (17 hours ago)
* e23d9f8 Nick Nisi: adjust animation to 305 -   (17 hours ago)
* 72eb0c2 Nick Nisi: adjust animation to 304 -   (17 hours ago)
* 5e4cee6 Nick Nisi: adjust animation to 303 -   (17 hours ago)
* 4f88c8d Nick Nisi: adjust animation to 302 -   (17 hours ago)
* 9378fec Nick Nisi: adjust animation speed slowing down again -   (17 hours ago)
* cc62c6f Nick Nisi: adjust animation speed slowing down -   (17 hours ago)
* faa0412 Nick Nisi: adjust animation speed speed up again -   (17 hours ago)
* 4e024b6 Nick Nisi: adjust animation speed speed up -   (17 hours ago)
* 983eb1f Nick Nisi: adjust animation speed speed up -   (17 hours ago)
* 00f4ca5 Nick Nisi: adjust animation speed speed up -   (17 hours ago)
* 06badcb Nick Nisi: adjust animation speed -   (17 hours ago)
* d1ebc8e Nick Nisi: adjust box size -   (17 hours ago)
* d3d2d4d Nick Nisi: change box size -   (17 hours ago)
* ecf34f6 Nick Nisi: change border color -   (17 hours ago)
* de9bb1f Nick Nisi: add h2 tag contents -   (17 hours ago)
* 2210aca Nick Nisi: add h2 tag -   (17 hours ago)
* 37d0821 Nick Nisi: GOOD STATE -   (17 hours ago)
```

The good news is that we can! The bad news is that it needs to be used with caution.
The [Github Help page](https://help.github.com/articles/interactive-rebase) states it best:

> **Warning**: It is considered bad practice to rebase commits which you have already pushed to a remote repository. Doing so may invoke the wrath of the git gods.

When you run an interactive rebase, you are changing your git history. Commits will be
assigned new SHAs. If you have already pushed up and someone else has pulled down the changes, it will mess up their repository if you change the history out from under them.

Running `git rebase -i HEAD 4f88c8d will pop us into our editor and list all of the commits within the provided range.
Each commit will have the word *pick* next to it, meaning that we are picking this commit (leaving it as it is).
The other options are

+ reword - use commit but edit the commit message
+ edit - use commit, but stop for amending
+ squash - use commit, but meld into previous commit
+ fixup - like "squash", but discard this commit's log message
+ exec - run command


We can use the squash, pick, and fixup commands to simplify the repository.

#### Activity: Clean the history

Let's use our new knowledge of interactive rebase to clean up the bisect branch.

1. Let's branch off of bisect and do this in a new branch

```bash
git checkout bisect
git checkout -b rebase
```

1. Enter into an interactive rebase, down to the "GOOD STATE" commit

```bash
git rebase -i 37d0821
```

1. For each of the commits that have a similar message, select the top one to "pick". For the rest, select "squash"

```bash
pick 2210aca add h2 tag
pick de9bb1f add h2 tag contents
pick ecf34f6 change border color
pick d3d2d4d change box size
pick d1ebc8e adjust box size
pick 06badcb adjust animation speed
pick 00f4ca5 adjust animation speed speed up
pick 983eb1f adjust animation speed speed up
pick 4e024b6 adjust animation speed speed up
pick faa0412 adjust animation speed speed up again
pick cc62c6f adjust animation speed slowing down
pick 9378fec adjust animation speed slowing down again
pick 4f88c8d adjust animation to 302
squash 5e4cee6 adjust animation to 303
squash 72eb0c2 adjust animation to 304
squash e23d9f8 adjust animation to 305
squash f7a452d adjust animation to 306
squash 448e9e2 adjust animation to 307
squash 18ce973 adjust animation to 308
squash 2f3c3fc adjust animation to 309
squash 89390fa adjust animation to 310
squash 76162b0 adjust animation to 311
squash 507d90e adjust animation to 312
squash 7fd99d5 adjust animation to 313
squash 442c007 adjust animation to 314
squash 70f7912 adjust animation to 316
squash f84b4cd adjust animation to 317
squash a5ba9ac adjust animation to 318
squash 900b366 adjust animation to 319
squash fe321d9 adjust animation to 320
```

1. Complete by saving and closing your editor
1. Look at the new history in the log

```bash
* db86962 Nick Nisi: adjust animation to 302 -   (HEAD, rebase) (4 seconds ago)
* 9378fec Nick Nisi: adjust animation speed slowing down again -   (18 hours ago)
* cc62c6f Nick Nisi: adjust animation speed slowing down -   (18 hours ago)
* faa0412 Nick Nisi: adjust animation speed speed up again -   (18 hours ago)
* 4e024b6 Nick Nisi: adjust animation speed speed up -   (18 hours ago)
* 983eb1f Nick Nisi: adjust animation speed speed up -   (18 hours ago)
* 00f4ca5 Nick Nisi: adjust animation speed speed up -   (18 hours ago)
* 06badcb Nick Nisi: adjust animation speed -   (18 hours ago)
* d1ebc8e Nick Nisi: adjust box size -   (18 hours ago)
* d3d2d4d Nick Nisi: change box size -   (18 hours ago)
* ecf34f6 Nick Nisi: change border color -   (18 hours ago)
* de9bb1f Nick Nisi: add h2 tag contents -   (18 hours ago)
* 2210aca Nick Nisi: add h2 tag -   (18 hours ago)
* 37d0821 Nick Nisi: GOOD STATE -   (18 hours ago)
* a36751a Nick Nisi: add border to color box -   (18 hours ago)
* c287e19 Nick Nisi: fixing slider values -   (18 hours ago)
* 6f4edca Nick Nisi: messing with slider values -   (18 hours ago)
* 225c4ef Nick Nisi: adding width style -   (18 hours ago)
* 09ac64d Nick Nisi: adding height style -   (18 hours ago)
* 6148238 Nick Nisi: removed height/width -   (18 hours ago)
* d1e1701 Nick Nisi: removing border -   (18 hours ago)
* 2c9df68 Nick Nisi: adding cdn scripts -   (18 hours ago)
* 0763e15 Nick Nisi: initial commit of index -   (18 hours ago)
* 9f0ec0c Nick Nisi: Add editorconfig -   (20 hours ago)
* 39aad97 Nick Nisi: updating hub instructions -   (20 hours ago)
* 2922ce8 Nick Nisi: Added README and hub walkthrough -   (21 hours ago)
* 5fb2d99 Nick Nisi: Rename LICENSE.md to LICENSE -   (21 hours ago)
* 53cb134 Nick Nisi: Create LICENSE.md -   (21 hours ago)
```

### Learning more

We've only briefly covered a few of the really cool tricks you can do with git. Want to learn more? Check out these great resources!

+ [GitMinutes](http://www.gitminutes.com/) - A podcast for proficient git users
+ [Git and Github Secrets](http://zachholman.com/talk/git-github-secrets/) - A talk by Zach Holman of Github
+ [More Git and Github Secrets](http://zachholman.com/talk/more-git-and-github-secrets/) - More!
+ [GitReady](http://gitready.com/)
+ Peruse [dotfiles](https://github.com/nicknisi/dotfiles)!
