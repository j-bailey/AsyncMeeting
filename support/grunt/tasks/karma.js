"use strict";

var path = require('path');

module.exports = function(grunt) {
    var processStatus;
    grunt.registerTask('karma', function (configFile) {
        process.env.PORT = 3001;
        if(!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'dev-test';
        }
        process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));

        if (configFile.indexOf('integration') > -1) {
            grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']:5']);
        }

        grunt.task.run(['launch-karma-process:' + configFile]);

        if (configFile.indexOf('integration') > -1) {
            grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
        }
        grunt.task.run(['check-karma-status']);
    });

    grunt.registerTask('launch-karma-process', function(configFile) {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        console.log(JSON.stringify(process.env.PATH));
        childProcess = spawnSync('karma', ['start', configFile, '--single-run'], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        console.log('Child process = ' + JSON.stringify(childProcess));
        processStatus = childProcess.status;
    });

    grunt.registerTask('check-karma-status', function(){
        if (processStatus !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + processStatus), processStatus);
        }
    });

};
