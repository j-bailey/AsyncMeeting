#!/usr/bin/env node
"use strict";

process.on('unacaughtException', function(err){
    console.error('##### Uncaught Exception ######');
    if (err) {
        console.error(err);
        if (err.stack) {
            console.error(err.stack);
        }
    }
});

require('./config/configSetup');
var nconf = require('nconf');

var cluster = require('cluster');
// Ask the number of CPU-s for optimal forking (one fork per CPU)
var numCPUs = require('os').cpus().length,
    reservedCPUs = nconf.get('server:reservedCPUs'),
    singleProcess = nconf.get('server:singleProcess');

if (singleProcess) {
    numCPUs = 1;
} else if (numCPUs - reservedCPUs < 1) {
    throw new Error('resveredCPUs is too high and does not allow enough CPUs for the application.  ' +
        'Number of available CPUs is at: ' + numCPUs - reservedCPUs);
} else {
    numCPUs = numCPUs - reservedCPUs;
}

cluster.setupMaster({
    exec : './server/index.js' // Points to the index file you want to fork
});
// Fork workers.
for (var i = 0; i < numCPUs; i += 1) {
    cluster.fork();
}
cluster.on('disconnect', function(worker) {
    // FIXME This can probably use some work.
    console.log(worker);
    console.error('disconnect!');
    cluster.fork();
});



