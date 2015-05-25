/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    grunt.registerTask('karma', function () {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run([
            'start-redis-server',
            'start-mongo-server',
            'launch-karma-process']);
    });

    grunt.registerTask('launch-karma-process', function() {
        var childProcess,
            spawnSync = require('child_process').spawnSync;

        childProcess = spawnSync('karma', ['start', '--single-run'], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });
    });

};
