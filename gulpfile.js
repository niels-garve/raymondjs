var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    connect = require('gulp-connect');

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

gulp.task('watch', function() {
    connect.server({
        root: 'example',
        livereload: true,
        port: 3000
    });

    gulp.watch(['example/index.html', 'example/example.js', 'example/raymond.js'], connect.reload);
    gulp.watch(['dev/**/*.js'], ['rjs-copy']);
});

gulp.task('default', ['watch']);
gulp.task('build', ['rjs']);
