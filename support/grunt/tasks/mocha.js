/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    grunt.registerTask('mocha', function (testFolder) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run(['launch-mocha-process:' + testFolder]);
    });

    grunt.registerTask('launch-mocha-process', function(testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync;
console.log('folder ' + testFolder)
        childProcess = spawnSync('./node_modules/.bin/mocha', ['--recursive', '-R', 'spec', '-r', 'should', testFolder], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });
    });

};
