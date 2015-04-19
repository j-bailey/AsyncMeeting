/**
 * Created by jlb on 4/19/15.
 */
module.exports = function(grunt) {
    grunt.registerTask('mocha', function () {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run([
            'start-redis-server',
            'start-mongo-server',
            'launch-mocha-process',
            'start-redis-server',
            'kill-mongo-server']);
    });

    grunt.registerTask('launch-mocha-process', function(){
        var childProcess;
        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path'),
            spawnSync = require('child_process').spawnSync;

        childProcess = spawnSync('./node_modules/.bin/mocha', [], {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });
    });

}
