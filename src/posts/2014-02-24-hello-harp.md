---
title: "Hello, Harp!"
comments: true
tags:
  - Node
  - JavaScript
  - harp
published: true
type: "post"
---

I made the switch from Jekyll to [harp](http://harpjs.com) for this site.

## Why the change?

I wanted to give a Node.js static site generator a try and I looked closely at Harp because of it's effortless preprocessing. Without thinking about it I can use jade for the templates (what?!) and stylus for the css. I also like the idea of storing all post metadata in a json file rather than in YAML front matter.

The transition has not been as easy as I originally thought it was going to be. The biggest annoyance has been that `harp server` and `harp compile` generate
different markup. `harp server` starts up a server in development to handle preprocessing assets and then delivers them up at URLS like `/posts/post-name`. Then, when
running `harp compile` the same post will be served up as `/posts/post-name.html` which broke all of my links. I was hoping there was a way I could configure harp to
create directories and place the HTML files in there as index.html, similar to how jekyll can be configured to do it, but that is not going to be supported by harp
according to this [issue](https://github.com/sintaxi/harp/issues/149).

## The solution

That same issue provided a simple shell script that can be run after `harp compile` to convert `posts/foo.html` to `posts/foo/index.html`, allowing me to have the
URLs I want. I have slightly modified the script as follows:

```bash
# move html files into directories, giving us about/ instead of about.html
for FILENAME in www/*.html www/**/*.html; do
	[[ "$FILENAME" =~ \/?index.html ]] && continue
	DIRNAME="${FILENAME%.html}"
	echo "change: $DIRNAME"
	mkdir -p "$DIRNAME"
	mv "$FILENAME" "$DIRNAME/index.html"
done
```

Overall, I do like harp. I hope to start writing a lot more. With this post I've already doubled my yearly post count!
