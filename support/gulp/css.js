"use strict";

var gulp = require('gulp');

gulp.task('css', function () {
    gulp.src('client/css/**/*.css').pipe( gulp.dest('assets'));
    gulp.src('client/css/**/*.css').pipe( gulp.dest('build/assets'));
});

gulp.task('watch:css', function () {
    gulp.watch('client/css/**/*.css', ['css']);
});
