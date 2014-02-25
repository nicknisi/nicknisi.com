#!/bin/sh

for FILENAME in www/*.html www/**/*.html; do
	[[ "$FILENAME" =~ \/?index.html ]] && continue
	DIRNAME="${FILENAME%.html}"
	echo "change: $DIRNAME"
	mkdir -p "$DIRNAME"
	mv "$FILENAME" "$DIRNAME/index.html"
done
