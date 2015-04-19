module.exports = function (grunt) {
    var redisServer;
    var calledBeforeExit = 0;

    grunt.registerTask('start-redis-server', function () {
        var done = this.async();
        var isRunning = false;


        var fs = require('fs');

        redisServer = grunt.util.spawn({cmd:'redis-server'});

        redisServer.on('close', function (code, signal) {
            if (signal) {
                console.log('Redis server process terminated due to receipt of signal ' + signal);
            } else {
                console.log('Redis server process terminated normally');
            }
            if (!isRunning ){
                done(new Error('Redis server failed, due to error'));
                redisServer.kill();
            }
        });

        redisServer.stdout.on('data', function(data) {
            grunt.log.writeln(data);
            if (/server is now ready to accept connections/.exec(data)) {
                isRunning = true;
                done();
            }
        });

        setTimeout(function() {
            if (!isRunning) {
                done(new Error('Redis server failed to start'));
                redisServer.kill();
            }
        }, 10000);
    });

    grunt.registerTask('kill-redis-server', function () {
        redisServer.kill();
    });

};