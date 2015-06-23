/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    var processStatus;
    grunt.registerTask('mocha', function (testFolder) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']:5']);
        grunt.task.run(['launch-mocha-process:' + testFolder]);
        grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services', 'check-mocha-status']);
    });

    grunt.registerTask('launch-mocha-process', function(testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        childProcess = spawnSync('./node_modules/.bin/mocha', ['--recursive', '-R', 'spec', '-r', 'should', testFolder], {
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
    })
};
