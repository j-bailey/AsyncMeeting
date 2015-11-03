"use strict";

var path = require('path');

module.exports = function(grunt) {
    grunt.registerTask('e2e', function (testBrowser, proxy, cucumberTags) {
        var browser = (testBrowser || 'chrome').toLowerCase();
        var runInjectionProxy = proxy;

        process.env.PORT = 3001;
        if(!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'dev-test';
        }
        process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));

        grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']']);

        if (runInjectionProxy) {
            grunt.task.run(['run-injection-proxy']);
            grunt.config.set('cucumbertags', '@proxy_test');
            grunt.task.run(['protractor:' + browser]);
        } else if (cucumberTags) {
            console.log('Cucumber Tags: ' + cucumberTags);
            grunt.config.set('cucumberTags', cucumberTags);
            grunt.task.run(['protractor:' + browser ]);
        } else {
            grunt.task.run(['protractor:' + browser + 'NoTags']);
        }

        grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
    });
};
