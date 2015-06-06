/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    grunt.registerTask('karma', function (configFile) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run(['launch-karma-process:' + configFile]);
    });

    grunt.registerTask('launch-karma-process', function(configFile) {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        childProcess = spawnSync('karma', ['start', configFile, '--single-run'], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        if (childProcess.status !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + childProcess.status), childProcess.status);
        }
    });

};
