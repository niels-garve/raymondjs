'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var assign = require('lodash.assign');
var connect = require('gulp-connect');
var spawn = require('child_process').spawn;
var browserSync = require('browser-sync');

// add custom browserify options here
var customOpts = {
    entries: ['./server/engine.js'],
    debug: true,
    standalone: 'Raymond'
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

b.transform('brfs');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('server/engine.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./client'))
        .pipe(connect.reload());
}

gulp.task('connect', function() {
    connect.server({
        root: 'client',
        livereload: true
    });
});

/*
 * jekyll build
 */

gulp.task('jekyll-build', function( done ) {
    // TODO spawn uses wrong executable
    spawn('jekyll', ['build'], { stdio: 'inherit' })
        .on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], browserSync.reload);

gulp.task('serve', ['jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        open: false
    });

    gulp.watch([
        'index.md',
        '_layouts/*.html',
        '_sass/**/*.scss'
    ], ['jekyll-rebuild']);
});
