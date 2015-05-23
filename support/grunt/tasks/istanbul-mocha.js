/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    grunt.registerTask('istanbul-mocha', function () {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run([
            'start-redis-server',
            'start-mongo-server',
            'launch-istanbul-mocha-process',
            'start-redis-server',
            'kill-mongo-server']);
    });

    grunt.registerTask('launch-istanbul-mocha-process', function() {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        // TODO Remove external dependencies from Mocha server unit tests
            childProcess = spawnSync('./node_modules/.bin/istanbul',
                ['cover', './node_modules/.bin/_mocha', '--', '--recursive', '-R', 'spec', '-r', 'should'], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });
    });

};
