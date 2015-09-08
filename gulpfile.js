/*jshint node:true*/
var gulp = require('gulp');
var frontMatter = require('gulp-front-matter');
var marked = require('marked');
var serveStatic = require('serve-static');
var rename = require('gulp-rename');
var jade = require('jade');
var gulpJade = require('gulp-jade');
var stylus = require('gulp-stylus');
var rsync = require('gulp-rsync');
var http = require('http');
var finalhandler = require('finalhandler');
var del = require('del');
var through = require('through2');
var path = require('path');

var site = require('./site');
var postsGlob = 'src/posts/*.md';

function collectPosts() {
	var posts = site.posts = [];
	return through.obj(function (file, enc, cb) {
		var post = file.page;
		post.slug = path.basename(file.path, '.md');
		post.content = file.contents.toString();
		post.date = new Date(post.slug.substr(0, 10));
		post.dateString = convertDate(post.date);
		posts.push(post);
		this.push(file);
		cb();
	}, function (cb) {
		// sort the posts by date
		posts.sort(function (a, b) {
			var d1 = a.date;
			var d2 = b.date;
			return d2 - d1;
		});
		cb();
	});
}

function convertDate(date) {
	var months = [
		'January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'
	];

	var dd =  months[date.getMonth()] + ' ' + date.getUTCDate() + ', ' + date.getFullYear();
	return dd;
}

function applyTemplate(template) {
	return through.obj(function (file, enc, cb) {
		var html = jade.renderFile(template, {
			marked: marked,
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

gulp.task('posts', function () {
	return gulp.src(postsGlob)
		.pipe(frontMatter({
			property: 'page',
			remove: true
		}))
		// .pipe(marked())
		.pipe(collectPosts())
		.pipe(applyTemplate('src/templates/post.jade'))
		.pipe(rename(function (_path) {
			_path.dirname = path.join(_path.dirname, _path.basename);
			_path.basename = 'index';
			_path.extname = '.html';
		}))
		.pipe(gulp.dest('dist/posts'));
});

gulp.task('jade', [ 'posts' ], function () {
	return gulp.src([ 'src/**/*.jade', '!src/templates/*.jade', '!src/layouts/*.jade' ])
		.pipe(gulpJade({
			locals: {
				site: site
			}
		}))
		.pipe(rename(function (_path) {
			if (_path.basename !== 'index') {
				_path.dirname = path.join(_path.dirname, _path.basename);
				_path.basename = 'index';
				_path.extname = '.html';
			}
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('markdown', function () {
	return gulp.src(['src/*.md'])
		.pipe(applyTemplate('src/templates/post.jade'))
		.pipe(rename(function (_path) {
			_path.dirname = path.join(_path.dirname, _path.basename);
			_path.basename = 'index';
			_path.extname = '.html';
		}))
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
	return gulp.src(['src/assets/images/**/*'])
		.pipe(gulp.dest('dist/assets/images'));
});

gulp.task('images:posts', function () {
	return gulp.src(['src/posts/images/**/*'])
		.pipe(gulp.dest('dist/posts/images'));
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

gulp.task('watch', ['default'], function () {
	gulp.watch([ postsGlob ], [ 'posts' ]);
	gulp.watch([ 'src/**/*.jade' ], [ 'jade' ]);
	gulp.watch([ 'src/*.md' ], [ 'markdown' ]);

	var serve = serveStatic('dist');
	var server = http.createServer(function (req, res) {
		serve(req, res, finalhandler(req, res));
	});

	server.listen(3000);
});

gulp.task('default', [ 'posts', 'jade', 'stylus', 'images', 'images:posts' ]);
