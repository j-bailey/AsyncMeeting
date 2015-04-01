var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync(__dirname + '/gulp').forEach(function (task) {
    require('./gulp/' + task)
});

gulp.task('dev', ['css', 'images', 'js', 'html', 'watch:css', 'watch:images', 'watch:js', 'watch:html', 'watch:config', 'dev:server']);




