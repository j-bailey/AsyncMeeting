"use strict";

var fs = require('fs'),
    path = require('path');

module.exports = function (grunt) {
    var processStatus;
    grunt.registerTask('mocha', function (testFolder, isLocalDockerRun, noServer, proto, sHost, sPort, dHost, dPort, dName) {
        process.env.PORT = 3001;
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
        } else {
            process.env.configOverrideFile = path.normalize(path.join(__dirname, '../../../config/test.json'));
        }

        if (protocol === 'https'){
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
        }
        process.env.baseUrl = protocol + '://' + srvHost + ':' + srvPort;

        console.log('NODE_ENV = ' + process.env.NODE_ENV);

        if (testFolder.indexOf('integration') > -1 &&
            !(isLocalDockerRun && isLocalDockerRun.toUpperCase() === 'TRUE') && !(noServer && noServer.toUpperCase() === 'TRUE')) {
            grunt.task.run(['start-external-services', 'file-launch:gulpTestServer:gulp:[\'test|server\']:3']);
        }
        grunt.task.run(['launch-mocha-process:' + testFolder]);

        if (testFolder.indexOf('integration') > -1 &&
            !(isLocalDockerRun && isLocalDockerRun.toUpperCase() === 'TRUE') && !(noServer && noServer.toUpperCase() === 'TRUE')) {
            grunt.task.run(['file-launch-kill:gulpTestServer', 'kill-external-services']);
        }
        grunt.task.run(['check-mocha-status']);
    });

    grunt.registerTask('launch-mocha-process', function (testFolder) {
        var childProcess,
            spawnSync = require('child_process').spawnSync,
            cmdArgs = [];

        if (fs.existsSync(path.join(testFolder, 'mocha.opts'))) {
            console.log('using mocha.opts ' + path.join(testFolder, 'mocha.opts'));
            cmdArgs.push('--opts');
            cmdArgs.push(path.join(testFolder, 'mocha.opts'));
        }
        //cmdArgs.push(testFolder);
        childProcess = spawnSync('./node_modules/mocha/bin/mocha', cmdArgs, {
            detached: false,
            stdio: 'inherit',
            env: process.env
        });

        processStatus = childProcess.status;
    });

    grunt.registerTask('check-mocha-status', function () {
        if (processStatus !== 0) {
            grunt.fail.warn(new Error('Failed with code: ' + processStatus), processStatus);
        }
    });
};
