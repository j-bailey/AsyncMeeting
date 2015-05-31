/**
 * Created by jlb on 4/19/15.
 */

var fs = require('fs');

module.exports = function(grunt) {
    grunt.registerTask('istanbul-mocha', function (configFile, testFolder) {
        process.env.PORT = 3001;
        process.env.NODE_ENV = 'test';

        grunt.task.run(['launch-istanbul-mocha-process:' + configFile + ':' + testFolder]);
    });

    grunt.registerTask('launch-istanbul-mocha-process', function(configFile, testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync,
            cmdArgs;

        console.log('test flder ' + testFolder)

        if (fs.existsSync(configFile)) {
            cmdArgs = ['cover', '--config=' + configFile, './node_modules/.bin/_mocha', '--', '--recursive', '-R', 'spec', '-r', 'should', testFolder];
        } else {
            cmdArgs = ['cover', './node_modules/.bin/_mocha', '--', '--recursive', '-R', 'spec', '-r', 'should', testFolder];
        }


        // TODO Remove external dependencies from Mocha server unit tests
            childProcess = spawnSync('./node_modules/.bin/istanbul', cmdArgs, {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });
    });

};
