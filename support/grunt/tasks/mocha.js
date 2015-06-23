var fs = require('fs'),
    path = require('path');

module.exports = function(grunt) {
    var processStatus;
    grunt.registerTask('mocha', function (testFolder) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        if (testFolder.indexOf('integration') > -1){
            grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']:2']);
        }
        grunt.task.run(['launch-mocha-process:' + testFolder]);

        if (testFolder.indexOf('integration') > -1) {
            grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
        }
        grunt.task.run(['check-mocha-status']);
    });

    grunt.registerTask('launch-mocha-process', function(testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync,
            cmdArgs = [];

        if (fs.existsSync(path.join(testFolder, 'mocha.opts'))) {
            cmdArgs.push('--opts');
            cmdArgs.push(path.join(testFolder, 'mocha.opts'));
        }
        //cmdArgs.push(testFolder);
        childProcess = spawnSync('./node_modules/.bin/mocha', cmdArgs, {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        processStatus = childProcess.status;
    });

    grunt.registerTask('check-mocha-status', function(){
        if (processStatus !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + processStatus), processStatus);
        }
    });
};
