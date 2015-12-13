"use strict";

var gulp = require('gulp');

gulp.task('config', function() {
    gulp.src('config/**/*.*').pipe(gulp.dest('build/config'));
    //gulp.src(['client/**/*.html']).pipe(gulp.dest('assets'));
});

gulp.task('watch:config', ['config'], function () {
    gulp.watch('config/**/*.json', ['config']);
});
