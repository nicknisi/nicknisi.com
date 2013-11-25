---
layout: post
title: "Lint JavaScript on Commit"
date: 2012-11-12 20:18
comments: true
categories: [JavaScript, git, JSHint]
---

My team has been working a lot to improve our code quality and to introduce best practices between us. One way we've done this is through the use of
[JSHint](http://jshint.com). Because we use different editors it can be difficult to make sure that everyone's environment is configured to analyze
code the same way, but git is a common tool between us. Here is a pre-commit hook, which checks all .js files included in the commit against your
JSHint configuration. If it doesn't pass, the errors are printed to the screen and the commit is cancelled.

{% gist 4059921 %}
