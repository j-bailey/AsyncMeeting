var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('js', function () {
//    gulp.src(['client/ng/module.js', 'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js')).pipe(ngAnnotate()).pipe(uglify()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
    gulp.src(['client/ng/module.js', 'client/ng/**/*.js']).pipe(sourcemaps.init()).pipe(concat('app.js')).pipe(ngAnnotate()).pipe(sourcemaps.write()).pipe(gulp.dest('assets'));
});


gulp.task('watch:js', ['js'], function () {
    gulp.watch('client/ng/**/*.js', ['js'])
});