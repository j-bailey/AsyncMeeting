"use strict";

var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync(__dirname + '/support/gulp').forEach(function (task) {
    require('./support/gulp/' + task);
});

gulp.task('dev', ['css', 'images', 'js', 'html', 'watch:css', 'watch:images', 'watch:js', 'watch:html', 'watch:config', 'dev:server']);

gulp.task('build', ['server', 'css', 'images', 'js', 'html', 'config']);

