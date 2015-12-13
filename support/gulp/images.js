"use strict";

var gulp = require('gulp');

gulp.task('images', function() {
    gulp.src('client/images/**/*').pipe( gulp.dest('assets/images'));
    gulp.src('client/images/**/*').pipe( gulp.dest('build/assets/images'));
});

gulp.task('watch:images', function () {
    gulp.watch('client/images/**/*', ['images']);
});
