/**
 * Created by jlb on 4/19/15.
 */

var fs = require('fs'),
    path = require('path'),
    processFileDir = path.normalize(path.join(__dirname, '..', '..', '..', 'tmp', 'process-files'));

module.exports = function (grunt) {

    grunt.registerTask('file-launch', function (processId, cmd, cmdArgs, pause) {
        var processFileServer;
        var
            nodeFs = require('node-fs'),
            logPath = path.join('.', 'tmp', 'file-launch'),
            processFile = path.join(processFileDir, processId + '.prc'),
            spawn = require('child_process').spawn;

        if (!fs.existsSync(logPath)) {
            nodeFs.mkdirSync(logPath, 511, true);
        }

        if (!fs.existsSync(processFileDir)) {
            nodeFs.mkdirSync(processFileDir, 511, true);
        }

        fs.writeSync(fs.openSync(processFile, 'w', 511), '', 0,0);
        var out = fs.openSync(path.join(logPath, processId + '-server.log'), 'a'),
            err = fs.openSync(path.join(logPath, processId + '-server.log'), 'a');


        var args = ['support/grunt/file-launch-server', processFile, cmd];
        if (cmdArgs && typeof cmdArgs === 'string' && cmdArgs.length > 0) {
            cmdArgs = JSON.parse(cmdArgs.replace(/'/g, '"').replace(/\|/g, ':'));
            args.push.apply(args, cmdArgs);
        }
        console.log('args = ' + JSON.stringify(args));
        processFileServer = spawn('node', args, {
            detached: true,
            stdio: ['ignore', out, err],
            env: process.env
        });

        processFileServer.unref();
        if (pause) {
            var done = this.async();

            setTimeout(function () {
                done();
            }, pause * 1000);
            return done;
        }
    });

    grunt.registerTask('file-launch-kill', function (processId) {
        var processFile = path.join(processFileDir, processId + '.prc'),
            done = this.async(),
            rimraf = require('rimraf');
        console.log('Killing process for process ID: ' + processId);
        fs.appendFile(processFile, 'kill command', function (err) {
            if (err){
                console.error('Error sending kill command to file');
            }
            setTimeout(function() {
                    rimraf(processFile, function(err){
                        if (err) {done(err);}
                        done();
                    });
                }, 1500
            );
        });
        return done;
    });
};
