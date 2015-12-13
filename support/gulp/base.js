"use strict";

var gulp = require('gulp');

gulp.task('base', function() {
    gulp.src('.bowerrc').pipe(gulp.dest('build'));
    gulp.src('app.js').pipe(gulp.dest('build'));
    gulp.src('bower.json').pipe(gulp.dest('build'));
    gulp.src('Gruntfile.js').pipe(gulp.dest('build'));
    gulp.src('gulpfile.js').pipe(gulp.dest('build'));
    gulp.src('package.json').pipe(gulp.dest('build'));
    gulp.src('server.js').pipe(gulp.dest('build'));
    gulp.src('https.key').pipe(gulp.dest('build'));
    gulp.src('https.cert').pipe(gulp.dest('build'));
    gulp.src('assets/**/*').pipe(gulp.dest('build/assets'));
});

gulp.task('watch:config', ['config'], function () {
    gulp.watch('config/**/*.json', ['config']);
});
