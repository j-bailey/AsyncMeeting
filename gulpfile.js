var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync(__dirname + '/gulp').forEach(function (task) {
    require('./gulp/' + task)
});

gulp.task('dev', ['css', 'js', 'html', 'watch:css', 'watch:js', 'watch:html', 'dev:server']);




