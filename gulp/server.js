var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('dev:server', function () {
    console.log('Server starting');
    nodemon({script: 'server.js', ext: 'js', ignore: [' ng*', 'gulp*', 'assets*']});
    console.log('Server started');
});



