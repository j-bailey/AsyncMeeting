"use strict";

module.exports = function (grunt) {
    var gulpTask = null;

    grunt.registerTask('call-gulp-task', function (task, timeout, readyText) {
        var done;
        done = this.async();

        var isRunning = false;

        var spawn = require('child_process').spawn;

        console.log('task ' + task.replace(/\|/g, ':'));
        console.log('readyText = ' + readyText);
        gulpTask = spawn('gulp', [task.replace(/\|/g, ':')]);

        gulpTask.on('close', function (code, signal) {
            if (signal) {
                grunt.log.writeln('Gulp task terminated due to receipt of signal ' + signal);
            }

            grunt.log.writeln('Gulp task finished with code ' + code);
            if (code === 0) {
                done();
            } else {
                done(new Error('Gulp task finished with error code of ' + code));
            }

        });

        gulpTask.stdout.on('data', function (data) {
            console.log('Gulp- ' + task + ' stdout: ' + data);
            if (readyText && !isRunning){
                console.log('#####  ' + (new RegExp(readyText)).exec(data));
                if ((new RegExp(readyText)).exec(data)){
                    console.log('#### Heree');
                    isRunning = true;
                    done();
                }
            }
        });

        gulpTask.stderr.on('data', function (data) {
            console.log('Gulp- ' + task + ' stderr: ' + data);
        });

        if (timeout) {
            setTimeout(function () {
                if (!isRunning) {
                    grunt.error.write('Grunt task "' + task + '" failed to finish before timeout');
                    done(new Error('Gulp task failed to finish before timeout'));
                    gulpTask.kill();
                }
            });
        }
    });
};
