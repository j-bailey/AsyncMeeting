var gulp = require('gulp');

gulp.task('html', function () {
    // TODO Need to re-enable uglify for release
//    gulp.src(['client/ng/module.js', 'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js'))
// .pipe(ngAnnotate()).pipe(uglify()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
//    gulp.src(['client/ng/views/**/*.html']).pipe(gulp.dest('assets/views'));
//    gulp.src(['client/ng/layouts/**/*.html']).pipe(gulp.dest('assets/layouts'));
    gulp.src(['client/**/*.html']).pipe(gulp.dest('assets'));
});

gulp.task('watch:html', ['html'], function () {
    gulp.watch('client/**/*.html', ['html']);
});
