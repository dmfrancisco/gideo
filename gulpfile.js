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
  vendor: {
    assets: [
      './node_modules/video.js/dist/video-js/video-js.swf'
    ],
    scripts: [
      './node_modules/video.js/dist/video-js/video.js'
    ],
  },
  build: {
    src: [
      './embed.js'
    ],
    dest: 'embed.min.js'
  },
  dist: ('gideo-'+ version.majorMinor +'.min.js'),
  banner: "/** <%= pkg.name %> v<%= pkg.version %> */\n"
}

// Copy vendor assets
gulp.task('copy-assets', function () {
  return gulp.src(config.vendor.assets)
    .pipe(gulp.dest('.'));
});

// Minify and concatenate application scripts
gulp.task('build', function() {
  return gulp.src(config.build.src)
    .pipe(uglify())
    .pipe(concat(config.build.dest))
    .pipe(gulp.dest('.'));
});

// Concatenate application and vendor scripts
gulp.task('dist', ['build'], function() {
  return gulp.src(
      config.vendor.scripts.concat([ config.build.dest ])
    )
    .pipe(concat(config.dist))
    .pipe(header(config.banner, { pkg: pkg }))
    .pipe(gulp.dest('.'));
});

// Rerun the tasks when a file changes
gulp.task('watch', ['default'], function(fn) {
  gulp.watch(config.build.src, ['dist']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy-assets', 'dist']);
