var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    browserSync = require('browser-sync');

gulp.task('rjs', function(done) {
    spawn('r.js', ['-o', 'build.js'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('rjs-copy', ['rjs'], function() {
    return gulp.src([
        'dist/raymond.js',
        'dist/raymond.js.map'
    ])
        .pipe(gulp.dest('example'));
});

gulp.task('watch',/* ['rjs-copy'],*/ function() {
    browserSync({
        server: {
            baseDir: '.'
        },
        open: false
    });

    //gulp.watch(['example/index.html', 'example/example.js', 'example/raymond.js'], browserSync.reload);
    //gulp.watch(['dev/**/*.js'], ['rjs-copy']);
});

gulp.task('default', ['watch']);
gulp.task('build', ['rjs']);
