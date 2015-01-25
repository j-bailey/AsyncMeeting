var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('css', function() {gulp.src('client/css/**/*.styl').pipe(stylus()).pipe( gulp.dest('assets')) })

gulp.task('watch:css', function () {
    gulp.watch('client/ng/**/*.styl', ['css'])
});