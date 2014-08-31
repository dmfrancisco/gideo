var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var info = require('./package.json');

var settings = {
  assets: [
    './node_modules/video.js/dist/video-js/video-js.swf'
  ],
  vendorScripts: [
    './node_modules/video.js/dist/video-js/video.js'
  ],
  appScripts: [
    './embed.js'
  ],
  appScript: 'embed.min.js',
  prodScript: ('gideo-'+ info.version +'.min.js')
}

// Copy vendor assets to the root folder
gulp.task('copy-assets', function () {
  return gulp.src(settings.assets)
    .pipe(gulp.dest('.'));
});

// Minify and concatenate application scripts
gulp.task('build-app', function() {
  return gulp.src(settings.appScripts)
    .pipe(uglify())
    .pipe(concat(settings.appScript))
    .pipe(gulp.dest('.'));
});

// Concatenate application and vendor scripts
gulp.task('build-prod', ['build-app'], function() {
  return gulp.src(
      settings.vendorScripts.concat([ settings.appScript ])
    )
    .pipe(concat(settings.prodScript))
    .pipe(gulp.dest('.'));
});

// Rerun the tasks when a file changes
gulp.task('watch', ['default'], function(fn) {
  gulp.watch(settings.appScripts, ['build-prod']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy-assets', 'build-prod']);
