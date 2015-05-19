/**
 * Created by jlb on 4/18/15.
 */

module.exports = function(grunt){
    grunt.registerTask('e2e', function (testBrowser, proxy) {
        var fs = require('fs'),
            path = require('path');
        var browser = (testBrowser || 'chrome').toLowerCase();
        var runInjectionProxy = proxy;

        process.env.PORT = 3001;
        process.env.NODE_ENV= 'test';

        grunt.task.run([
            'start-redis-server',
            'start-mongo-server',
            'web-launch:63636:gulp:[\'test|server\']']);

        if (runInjectionProxy) {
            grunt.task.run(['run-injection-proxy']);
            grunt.config.set('cucumbertags', '@proxy_test');
            grunt.task.run(['protractor:' + browser]);
        } else {
            grunt.task.run(['protractor:' + browser + 'NoTags']);
        }

        grunt.task.run(['kill-redis-server', 'kill-mongo-server', 'web-launch-kill:63636']);
    });
};