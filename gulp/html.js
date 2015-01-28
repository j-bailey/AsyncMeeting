var gulp = require('gulp');

gulp.task('html', function () {
//    gulp.src(['client/ng/module.js', 'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js')).pipe(ngAnnotate()).pipe(uglify()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
    gulp.src(['client/ng/views/**/*.html']).pipe(gulp.dest('assets/views'));
});


gulp.task('watch:html', ['html'], function () {
    gulp.watch('client/ng/**/*.html', ['html'])
});