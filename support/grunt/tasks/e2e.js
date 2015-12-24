"use strict";

var path = require('path');

module.exports = function (grunt) {
    grunt.registerTask('e2e', function (testBrowser, proxy, cucumberTags, isLocalDockerRun, noServer, proto, sHost, sPort, dHost, dPort, dName) {
        var browser = (testBrowser || 'chrome').toLowerCase();
        var runInjectionProxy = proxy;

        process.env.NODE_ENV = 'dev-test';

        var srvHost = (sHost || 'localhost'),
            srvPort = (sPort || 3001),
            dbHost = (dHost || 'localhost'),
            dbPort = (dPort || 27017),
            protocol = (proto || 'http'),
            dbName = (dName || 'asyncmeeting_test');


        if (isLocalDockerRun && isLocalDockerRun.toUpperCase() === 'TRUE') {
            console.log('Testing against local Docker site');
            var dockerIp = process.env.DOCKER_HOST.split(':')[1].split('/')[2];
            console.log('Docker host IP = ' + dockerIp);
            srvHost = dockerIp;
            dbHost = dockerIp;
            dbName = (dName || 'asyncmeeting_prod');
            protocol = (proto || 'https');
            srvPort = (sPort || 3000);
            process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/docker-test.json'));
        }
        if ((noServer && noServer.toUpperCase() === 'TRUE') || (isLocalDockerRun && isLocalDockerRun.toUpperCase() === 'TRUE')) {
            var dbConns = ['read-only', 'read-write', 'admin', 'session', 'acl'];
            for (var i =0; i < dbConns.length; i += 1) {
                var hostKey = 'database:' + dbConns[i] + ':host';
                var portKey = 'database:' + dbConns[i] + ':port';
                var dbNameKey = 'database:' + dbConns[i] + ':database';
                console.info('Key ' + hostKey + ' IP ' + dbHost);
                console.info('Key ' + portKey + ' IP ' + dbPort);
                console.info('Key ' + dbNameKey + ' IP ' + dbName);
                process.env[hostKey] = dbHost;
                process.env[portKey] = dbPort;
                process.env[dbNameKey] = dbName;
            }
            grunt.config.set('baseUrl', protocol +'://' + srvHost + ':' + srvPort);
        } else {
            console.log('Testing against localhost site');
            process.env.PORT = 3001;
            process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));

            grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']']);
            grunt.config.set('baseUrl', 'http://localhost:3001');
        }

        console.log('NODE_ENV = ' + process.env.NODE_ENV);

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

        if (!(isLocalDockerRun && isLocalDockerRun.toUpperCase() === 'TRUE') && !(noServer && noServer.toUpperCase() === 'TRUE')) {
            grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
        }
    });
};
