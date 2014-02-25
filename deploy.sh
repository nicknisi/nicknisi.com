#!/bin/sh

# clean up
rm -rf wwww/

# compile the static site
NODE_ENV="production" && harp compile

# move html files into directories, giving us about/ instead of about.html
for FILENAME in www/*.html www/**/*.html; do
	[[ "$FILENAME" =~ \/?index.html ]] && continue
	DIRNAME="${FILENAME%.html}"
	echo "change: $DIRNAME"
	mkdir -p "$DIRNAME"
	mv "$FILENAME" "$DIRNAME/index.html"
done

# deploy
rsync --compress --recursive --checksum --delete www/ nicknisi@nicknisi.com:/var/www/nicknisi.com/public_html
