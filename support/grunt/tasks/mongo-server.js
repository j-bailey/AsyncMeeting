
module.exports = function(grunt) {
    var mongoServer = null;
    grunt.registerTask('start-mongo-server', function(){
        var done = this.async();
        var isRunning = false;

        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path');

        var dbPath = path.join('.', 'tmp', 'data', 'db');
        if (!fs.existsSync(dbPath)){
            nodeFs.mkdirSync(dbPath, 511, true);
        }

        mongoServer = grunt.util.spawn({
            cmd: 'mongod',
            args: ['--dbpath', path.join('.', 'tmp', 'data', 'db')]
        });

        mongoServer.on('close', function (code, signal) {
            if (signal) {
                console.log('MongoDB server process terminated due to receipt of signal ' + signal);
            } else {
                console.log('MongoDB server process normally');
            }
            if (!isRunning ){
                done(new Error('MongoBD server failed, due to error'));
                mongoServer.kill();
            }
        });

        mongoServer.stdout.on('data', function(data) {
            grunt.log.writeln(data);
            if (/waiting for connections on port/.exec(data)) {
                isRunning = true;
                done();
            }
        });

        setTimeout(function() {
            if (!isRunning) {
                done(new Error('Redis server failed to start'));
                mongoServer.kill();
            }
        }, 10000);

    });

    grunt.registerTask('kill-mongo-server', function(){
        var done = this.async();
        var isRunning = false;

        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path');

        var dbPath = path.join('.', 'tmp', 'data', 'db');
        if (!fs.existsSync(dbPath)){
            nodeFs.mkdirSync(dbPath, 511, true);
        }

        mongoServer = grunt.util.spawn({
            cmd: 'mongod',
            args: ['--shutdown']
        });

        mongoServer.on('close', function (code, signal) {
            if (signal) {
                console.log('MongoDB server process terminated due to receipt of signal ' + signal);
            } else {
                console.log('MongoDB server process normally');
            }
            if (!isRunning ){
                done(new Error('MongoBD server failed, due to error'));
                mongoServer.kill();
            }
        });

        mongoServer.stdout.on('data', function(data) {
            grunt.log.writeln(data);
            if (/waiting for connections on port/.exec(data)) {
                isRunning = true;
                done();
            }
        });

        setTimeout(function() {
            if (!isRunning) {
                done(new Error('Redis server failed to start'));
                mongoServer.kill();
            }
        }, 10000);

    });

};