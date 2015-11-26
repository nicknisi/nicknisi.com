/*jshint node:true*/
'use strict';

let gulp = require('gulp');
let gulpIf = require('gulp-if');
let frontMatter = require('gulp-front-matter');
let marked = require('marked');
let serveStatic = require('serve-static');
let rename = require('gulp-rename');
let jade = require('jade');
let gulpJade = require('gulp-jade');
let stylus = require('gulp-stylus');
let rsync = require('gulp-rsync');
let http = require('http');
let finalhandler = require('finalhandler');
let del = require('del');
let through = require('through2');
let pathUtil = require('path');

let site = require('./site');
let postsGlob = 'src/posts/*.md';

marked.setOptions({
	highlight: function (code, lang, callback) {
		require('pygmentize-bundled')({ lang, format: 'html' }, code, (err, result) => {
			callback(err, result.toString());
		});
	}
});

function convertDate(date) {
	let months = [
		'January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'
	];

	return months[date.getMonth()] + ' ' + date.getUTCDate() + ', ' + date.getFullYear();
}

function toMarkdown() {
	return through.obj(function (file, enc, cb) {
		marked(file.contents.toString(), (err, content) => {
			if (err) {
				throw err;
			}
			file.contents = new Buffer(content, 'utf8');
			this.push(file);
			cb();
		});
	});
}

function collectPosts() {
	let posts = site.posts = [];
	return through.obj(function (file, enc, cb) {
		let post = file.page;
		if (post.published) {
			post.slug = pathUtil.basename(file.path, '.md');
			post.content = file.contents.toString();
			post.date = new Date(post.slug.substr(0, 10));
			post.dateString = convertDate(post.date);
			posts.push(post);
			this.push(file);
		}
		cb();
	}, function (cb) {
		// sort the posts by date
		posts.sort((a, b) => { return b.date - a.date; });
		cb();
	});
}

function applyTemplate(template) {
	return through.obj(function (file, enc, cb) {
		let html = jade.renderFile(template, {
			marked: marked,
			passthrough: (str) => { return str; },
			pretty: true,
			site: site,
			page: file.page || { content: file.contents },
			contents: file.contents.toString()
		});
		file.contents = new Buffer(html, 'utf8');
		this.push(file);
		cb();
	});
}

function renameIndex(path) {
	let ext = pathUtil.extname(path.basename);
	if (!ext && path.basename !== 'index') {
		path.dirname = pathUtil.join(path.dirname, path.basename);
		path.basename = 'index';
	}

	path.basename = pathUtil.basename(path.basename, ext);
	path.extname = ext || '.html';
}

gulp.task('posts', function () {
	return gulp.src(postsGlob)
		.pipe(frontMatter({
			property: 'page',
			remove: true
		}))
		.pipe(toMarkdown())
		.pipe(collectPosts())
		.pipe(applyTemplate('src/templates/post.jade'))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist/posts'));
});

gulp.task('jade', ['posts'], function () {
	return gulp.src(['src/**/*.jade', '!src/templates/*.jade', '!src/layouts/*.jade'])
		.pipe(frontMatter({ property: 'page', remove: true }))
		.pipe(gulpJade({
			locals: {
				site: site
			}
		}))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist'));
});

gulp.task('markdown', function () {
	return gulp.src(['src/*.md'])
		.pipe(toMarkdown())
		.pipe(applyTemplate('src/templates/page.jade'))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
	return gulp.src('src/assets/styles/**/*.css', { base: 'src' })
		.pipe(gulp.dest('dist'));
});

gulp.task('stylus', function () {
	return gulp.src('src/assets/styles/main.styl')
		.pipe(stylus({
			compress: true
		}))
		.pipe(gulp.dest('dist/assets/styles'));
});

gulp.task('images', function () {
	return gulp.src(['src/assets/images/**', 'src/posts/images/**'], { base: 'src' })
		.pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
	return del([
		'dist/**/*'
	]);
});

gulp.task('deploy', ['default'], function () {
	return gulp.src('dist/**')
		.pipe(rsync({
			root: 'dist',
			hostname: 'nicknisi.com',
			destination: '/var/www/nicknisi.com/public_html',
			compress: true,
			recursive: true,
			delete: true,
			checksum: true
		}));
});

gulp.task('watch', function () {
	gulp.watch([postsGlob ], ['posts']);
	gulp.watch(['src/**/*.jade'], ['jade']);
	gulp.watch(['src/*.md'], ['markdown']);
	gulp.watch(['src/assets/styles/**/*.styl'], ['stylus']);
	// gulp.watch(['gulpfile.js'], ['default']);

	let serve = serveStatic('dist');
	let server = http.createServer(function (req, res) {
		serve(req, res, finalhandler(req, res));
	});
	let port = 3000;

	console.log(`web server running at http://localhost:${port}/`);
	server.listen(port);
});

gulp.task('styles', ['css', 'stylus']);

gulp.task('default', ['posts', 'markdown', 'jade', 'styles', 'images']);
