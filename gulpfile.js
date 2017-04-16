/*jshint node:true*/
'use strict';

const gulp = require('gulp');
const frontMatter = require('gulp-front-matter');
const marked = require('marked');
const serveStatic = require('serve-static');
const rename = require('gulp-rename');
const pug = require('pug');
const gulpPug = require('gulp-pug');
const stylus = require('gulp-stylus');
const rsync = require('gulp-rsync');
const http = require('http');
const finalhandler = require('finalhandler');
const del = require('del');
const through = require('through2');
const pathUtil = require('path');

const site = require('./site');
const postsGlob = 'src/posts/*.md';

marked.setOptions({
	highlight: function (code, lang, callback) {
		require('pygmentize-bundled')({ lang, format: 'html' }, code, (err, result) => {
			callback(err, result.toString());
		});
	}
});

function convertDate(date) {
	const months = [
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
		const html = pug.renderFile(template, {
			marked,
			passthrough: (str) => { return str; },
			pretty: true,
			site,
			page: file.page || { content: file.contents },
			contents: file.contents.toString()
		});
		file.contents = new Buffer(html, 'utf8');
		this.push(file);
		cb();
	});
}

function renameIndex(path) {
	const ext = pathUtil.extname(path.basename);
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
		.pipe(applyTemplate('src/templates/post.pug'))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist/posts'));
});

gulp.task('pug', ['posts'], function () {
	return gulp.src(['src/**/*.pug', '!src/templates/*.pug', '!src/layouts/*.pug'])
		.pipe(gulpPug({ locals: { site } }))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist'));
});

gulp.task('markdown', function () {
	return gulp.src(['src/*.md', '!src/resume.md'])
		.pipe(frontMatter({
			property: 'page',
			remove: true
		}))
		.pipe(toMarkdown())
		.pipe(applyTemplate('src/templates/page.pug'))
		.pipe(rename(renameIndex))
		.pipe(gulp.dest('dist'));
});

gulp.task('resume', ['resume:css'], function () {
	return gulp.src('src/resume.md')
		.pipe(toMarkdown())
		.pipe(rename(renameIndex))
		.pipe(applyTemplate('src/layouts/resume.pug'))
		.pipe(gulp.dest('dist'));
});

gulp.task('resume:css', function () {
	return gulp.src('src/assets/styles/resume.styl')
	.pipe(stylus({ compress: true }))
	.pipe(gulp.dest('dist/assets/styles'));
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
	gulp.watch(['src/**/*.pug'], ['pug']);
	gulp.watch(['src/*.md'], ['markdown']);
	gulp.watch(['src/assets/styles/**/*.styl'], ['stylus']);
	// gulp.watch(['gulpfile.js'], ['default']);

	const serve = serveStatic('dist');
	const server = http.createServer(function (req, res) {
		serve(req, res, finalhandler(req, res));
	});
	const port = 3000;

	console.log(`web server running at http://localhost:${port}/`);
	server.listen(port);
});

gulp.task('styles', ['css', 'stylus']);

gulp.task('default', ['pug', 'markdown', 'styles', 'images']);
