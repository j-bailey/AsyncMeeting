/**
 * Created by jlb on 4/19/15.
 */

module.exports = function (grunt) {

    grunt.registerTask('web-launch', function (port, cmd, cmdArgs, pause) {
        var webServer;
        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path'),
            logPath = path.join('.', 'tmp', 'web-launch'),
            spawn = require('child_process').spawn;

        if (grunt.config.get('webLaunchBaseIsRunning') === null) {
            grunt.config.set('webLaunchBaseIsRunning', false);
        }
        if (grunt.config.get('webLaunchBaseIsRunning')){
            grunt.task.run(['web-launch-base']);
        }
        if (!fs.existsSync(logPath)) {
            nodeFs.mkdirSync(logPath, 511, true);
        }

        var out = fs.openSync(path.join(logPath, cmd + '-server.log'), 'a'),
            err = fs.openSync(path.join(logPath, cmd + '-server.log'), 'a');

        console.log('--' + cmdArgs + '--');
        var args = ['support/grunt/web-launch-server', grunt.config.get('webLaunchBasePort'), port, cmd];
        if (cmdArgs && typeof cmdArgs === 'string' && cmdArgs.length > 0) {
            cmdArgs = JSON.parse(cmdArgs.replace(/'/g, '"').replace(/\|/g, ':'));
            args.push.apply(args, cmdArgs);
        }
        console.log('### 1');
        console.log('args = ' + JSON.stringify(args));
        webServer = spawn('node', args, {
            detached: true,
            stdio: ['ignore', out, err],
            env: process.env
        });

        webServer.unref();
        if (pause) {
            var done = this.async();

            setTimeout(function () {
                done();
            }, pause * 1000);
            return done;
        }
    });

    grunt.registerTask('web-launch-kill', function (port) {
        var http = require('http'),
            done = this.async();

        console.log('%%% -- ' + 'http://127.0.0.1:' + port + '/shutdown');

        http.get('http://127.0.0.1:' + port + '/shutdown', function (res) {
            console.log("Got response: " + res.statusCode);
            if (res.statusCode === 200) {
                done();
            } else {
                done('Not 200, but ' + res.statusCode);
            }
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
            http.get('http://127.0.0.1:' + port + '/shutdown', function (res) {
                console.log("Got response: " + res.statusCode);
                console.log('here');
                if (res.statusCode === 200) {
                    console.log('here');
                    //done();
                    //} else {
                    //    done('Not 200, but ' + res.statusCode)
                }
            }).on('error', function (e) {
                console.log("Got error: " + e.message);
            });
        });
        //
        //var req = http.request(options, function(res) {
        //    console.log('STATUS: ' + res.statusCode);
        //    console.log('HEADERS: ' + JSON.stringify(res.headers));
        //    res.setEncoding('utf8');
        //    res.on('data', function (chunk) {
        //        console.log('BODY: ' + chunk);
        //    });
        //});
        //
        //req.on('error', function(e) {
        //    console.log('problem with request: ' + e.message);
        //    done(new Error(e));
        //});
        //
        //req.end();
        setTimeout(function () {
            done('Timed out on web launch kill for port ' + port);
        }, 5000);
    });
};
