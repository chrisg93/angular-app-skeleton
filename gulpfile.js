var gulp         = require('gulp')
	addsrc       = require('gulp-add-src')
	autoprefixer = require('gulp-autoprefixer')
	changed      = require('gulp-changed')
	concat       = require('gulp-concat')
	del          = require('del')
	es           = require('event-stream')
	htmlify      = require('gulp-angular-htmlify')
	htmlmin      = require('gulp-htmlmin')
	inject       = require('gulp-inject')
	jshint       = require('gulp-jshint')
	less         = require('gulp-less')
	livereload   = require('gulp-livereload')
	minifyCss    = require('gulp-minify-css')
	uglify       = require('gulp-uglify');

var htmlminOpts = {
	collapseWhitespace : true,
	removeComments     : true
};

var fontsFiles = [
	"bower_components/bootstrap-less/fonts/*"
];

var jsFiles = [
	"src/app.js"
];

var jsLibFiles = [
	"bower_components/angularjs/angular.js"
];

var lessFiles = [
	"bower_components/bootstrap-less/less/bootstrap.less",
	"src/**/*.less"
];

var tmpAssets = [
	"tmp/css/**/*.css",
	"tmp/js/**/*.js"
]

/*
 * Task generating development files, watch them & rebuild
 */
gulp.task('default', ['buildTmp'], function() {

	gulp.watch([ 'src/**/*.js', 'src/**/*.less', 'src/**/*.html' ] , ['buildTmp'])

});

gulp.task('buildTmp', ['clean'], function() {

	/*
	 * Fonts
	 */
	gulp.src(fontsFiles)
		.pipe(gulp.dest('tmp/fonts'));


	/*
	 * Styles
	 */
	var styleStream = gulp.src(lessFiles)
		.pipe(changed('tmp/css'))
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(gulp.dest('tmp/css'));

	/*
	 * Javascript
	 */
	var jsStream = gulp.src(jsLibFiles.concat(jsFiles).concat("config/livereload.js"))
		.pipe(changed('tmp/js'))
		.pipe(gulp.dest('tmp/js'));
	
	/*
	 * HTML files
	 */
	gulp.src('src/**/*.html')
		.pipe(changed('tmp/partials'))
		.pipe(gulp.dest('tmp/partials'));

	gulp.src('src/index.html')
		.pipe(inject(es.merge(jsStream, styleStream), { read: false, relative: true }))
		.pipe(gulp.dest('tmp'))
		.pipe(livereload());

});

/*
 * Task generating production files
 */
gulp.task('dist', ['clean'], function() {

	/*
	 * Fonts
	 */
	gulp.src(fontsFiles)
		.pipe(gulp.dest('dist/fonts'));

	/*
	 * Styles
	 */
	gulp.src(lessFiles)
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(minifyCss())
		.pipe(gulp.dest('dist/css'));

	/*
	 * Javascript
	 */
	gulp.src(jsFiles)
		.pipe(jshint("config/jshint.json"))
		.pipe(jshint.reporter('default'))
		.pipe(addsrc(jsLibFiles))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
	
	/*
	 * HTML files
	 */
	gulp.src('src/**/*.html')
		.pipe(htmlify())
		.pipe(htmlmin(htmlminOpts))
		.pipe(gulp.dest('dist'));
});

/*
 * Clean folders
 */
gulp.task('clean', function(callback) {
	del(['tmp', 'dist'], callback);
});