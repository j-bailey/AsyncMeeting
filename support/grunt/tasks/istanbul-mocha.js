"use strict";

var path = require('path');

module.exports = function(grunt) {
    grunt.registerTask('istanbul-mocha', function (testFolder) {
        process.env.PORT = 3001;
        if(!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'dev-test';
        }
        process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));

        console.log('configOverrideFile = ' + process.env.configOverrideFile);

        grunt.task.run(['launch-istanbul-mocha-process:' + testFolder]);
    });

    grunt.registerTask('launch-istanbul-mocha-process', function(testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync,
            cmd = './node_modules/.bin/istanbul',
            testPath = path.normalize(testFolder),
            cmdArgs = ['cover', './node_modules/.bin/_mocha', '--', '--opts', path.join(testPath, 'mocha.opts'), testPath];


        // TODO Remove external dependencies from Mocha server unit tests
            console.log('Istanbul command: ' + cmd + ' ' + cmdArgs);
            childProcess = spawnSync(cmd, cmdArgs, {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        if (childProcess.status !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + childProcess.status), childProcess.status);
        }
    });
};
