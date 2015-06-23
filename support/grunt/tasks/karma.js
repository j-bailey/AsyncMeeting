/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    var processStatus;
    grunt.registerTask('karma', function (configFile) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']:5']);
        grunt.task.run(['launch-karma-process:' + configFile]);
        grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services', 'check-karma-status']);
    });

    grunt.registerTask('launch-karma-process', function(configFile) {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        childProcess = spawnSync('karma', ['start', configFile, '--single-run'], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        processStatus = childProcess.status;
    });

    grunt.registerTask('check-karma-status', function(){
        if (processStatus !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + processStatus), processStatus);
        }
    })

};
