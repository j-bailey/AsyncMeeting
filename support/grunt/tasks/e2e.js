"use strict";

var path = require('path');

module.exports = function (grunt) {
    grunt.registerTask('e2e', function (testBrowser, proxy, cucumberTags, isLocalDockerRun, noServer, proto, sHost, sPort, dHost, dPort) {
        var browser = (testBrowser || 'chrome').toLowerCase();
        var runInjectionProxy = proxy;

        process.env.NODE_ENV = 'dev-test';

        var srvHost = (sHost || 'localhost'),
            srvPort = (sPort || 3001),
            dbHost = (dHost || 'localhost'),
            dbPort = (dPort || 27017),
            protocol = (proto || 'http');

        if (isLocalDockerRun) {
            console.log('Testing against local Docker site');
            var dockerIp = process.env.DOCKER_HOST.split(':')[1].split('/')[2];
            console.log('Docker host IP = ' + dockerIp);
            srvHost = dockerIp;
            dbHost = dockerIp;
            protocol = (proto || 'https');
            srvPort = (sPort || 3000);
        }
        if (noServer || isLocalDockerRun) {
            var dbNames = ['read-only', 'read-write', 'admin', 'session', 'acl'];
            for (var dbn in dbNames) {
                var hostKey = 'database:' + dbNames[dbn] + ':host';
                var portKey = 'database:' + dbNames[dbn] + ':port';
                console.info('Key ' + hostKey + ' IP ' + dbHost);
                console.info('Key ' + portKey + ' IP ' + dbPort);
                process.env[hostKey] = dockerIp;
                process.env[portKey] = dbPort;
            }
            process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/docker-test.json'));
            grunt.config.set('baseUrl', protocol +'://' + srvHost + ':' + srvPort);
        } else {
            console.log('Testing against localhost site');
            process.env.PORT = 3001;
            process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));

            grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']']);
            grunt.config.set('baseUrl', 'http://localhost:3001');
        }

        if (runInjectionProxy) {
            grunt.task.run(['run-injection-proxy']);
            grunt.config.set('cucumberTags', '@proxy_test');
            grunt.task.run(['protractor:' + browser]);
        } else if (cucumberTags) {
            console.log('Cucumber Tags: ' + cucumberTags);
            grunt.config.set('cucumberTags', cucumberTags);
            grunt.task.run(['protractor:' + browser]);
        } else {
            grunt.task.run(['protractor:' + browser + 'NoTags']);
        }

        if (!isLocalDockerRun) {
            grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
        }
    });
};
