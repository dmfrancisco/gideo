var gulp = require('gulp');
var header = require('gulp-header');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var config, version = pkg.version.split('.');

version = {
  major: version[0],
  minor: version[1],
  patch: version[2],
  majorMinor: version[0] + '.' + version[1]
};

config = {
  vendor: [
    './node_modules/mediaelement/build/flashmediaelement.swf',
    './node_modules/mediaelement/build/mediaelement.min.js'
  ],
  build: [
    './embed.js'
  ],
  dist: ('gideo-'+ version.majorMinor +'.min.js'),
  banner: "/** <%= pkg.name %> v<%= pkg.version %> */\n"
}

// Copy vendor assets and scripts
gulp.task('copy-dependencies', function () {
  return gulp.src(config.vendor)
    .pipe(gulp.dest('.'));
});

// Minify and concatenate application scripts
gulp.task('build', function() {
  return gulp.src(config.build)
    .pipe(uglify())
    .pipe(concat(config.dist))
    .pipe(header(config.banner, { pkg: pkg }))
    .pipe(gulp.dest('.'));
});

// Rerun the tasks when a file changes
gulp.task('watch', ['default'], function(fn) {
  gulp.watch(config.build, ['build']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy-dependencies', 'build']);
