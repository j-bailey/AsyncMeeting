module.exports = function(grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        seleniumPort: 4444,
        cucumberTags: '~@proxy_test',
        webLaunchBasePort: 4422,
        webLaunchBaseIsRunning: false
    };

    function loadConfig(path) {
        var glob = require('glob');
        var object = {};
        var key;

        glob.sync('*', { cwd: path }).forEach(function(option) {
            key = option.replace(/\.js$/, '');
            object[key] = require(path + option);
        });

        return object;
    }

    grunt.util._.extend(config, loadConfig('./support/grunt/options/'));

    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-gulp');

    require('load-grunt-tasks')(grunt);

    grunt.loadTasks('support/grunt/tasks');

};
