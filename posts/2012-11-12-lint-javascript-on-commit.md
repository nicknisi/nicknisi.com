---
title: "Lint JavaScript on Commit"
permalink: "/posts/2012-11-12-lint-javascript-on-commit/"
tags:
  - javascript
  - git
  - jshint
---

My team has been working a lot to improve our code quality and to introduce best practices between us. One way we've done this is through the use of
[JSHint](http://jshint.com). Because we use different editors it can be difficult to make sure that everyone's environment is configured to analyze
code the same way, but git is a common tool between us. Here is a pre-commit hook, which checks all .js files included in the commit against your
JSHint configuration. If it doesn't pass, the errors are printed to the screen and the commit is cancelled.

```bash
#!/bin/sh
# JSHint Pre-Commit
# Place this in your .git/hooks/pre-commit directory and rename to `pre-commit`
# expects jshint to be installed in your projects node_modules directory

EXIT_CODE=0
COLOR_RED="\x1B[31m"
COLOR_GREEN="\x1B[32m"
COLOR_NONE="\x1B[0m"

repo=$( git rev-parse --show-toplevel )
jshint=${repo}/node_modules/jshint/bin/hint

for file in $( exec git diff-index --cached --name-only HEAD ); do
	if [[ $file == *".js"* ]]; then
		status=$( exec git status --porcelain $file )

		if [[ $status != D* ]]; then
			# ${jshint} ${repo}/${file} >/dev/null 2>&1
			${jshint} ${repo}/${file}
			EXIT_CODE=$((${EXIT_CODE} + $?))
		fi
	fi
done

echo ""
if [[ ${EXIT_CODE} -ne 0 ]]; then
	echo "${COLOR_RED}✘ JSHINT detected syntax problems.${COLOR_NONE}"
else
	echo "${COLOR_GREEN}✔ JSHINT detected no errors.${COLOR_NONE}"
fi

exit $((${EXIT_CODE}))
```
