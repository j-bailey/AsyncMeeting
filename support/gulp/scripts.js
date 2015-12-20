"use strict";

var gulp = require('gulp');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('js', function () {
    // TODO Need to re-enable uglify for release
//    gulp.src(['client/ng/module.js', 'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js'))
// .pipe(ngAnnotate()).pipe(uglify()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
    gulp.src([
        'client/ng/asm.js',
        'client/ng/modules/core/*.js',
        'client/ng/modules/register/*.js',
        'client/ng/modules/**/*.js',
        'client/ng/app.js',
        'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js'))
        .pipe(ngAnnotate()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
    //gulp.src('assets/app.js').pipe( gulp.dest('build/assets'));
});

gulp.task('watch:js', ['js'], function () {
    gulp.watch('client/ng/**/*.js', ['js']);
});
