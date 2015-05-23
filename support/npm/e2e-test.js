/**
 * Created by jlb on 4/18/15.
 */
var redisServer = require('./redis-server'),
    mongoServer = require('./mongo-server'),
    spawn = require('child_process').spawnSync;

var calledBeforeExit = 0,
    serverList = [redisServer, mongoServer];

function killProcesses() {
    serverList.forEach(function(process) {
        console.log('Killing process: ' + JSON.stringify(process.getProcessInfo()));
        process.kill();
    });
}

process.on('beforeExit', function () {
    if (calledBeforeExit > 0){
        return;
    }
    calledBeforeExit += 1;
    killProcesses();
});

process.on('SIGINT', function() {
    killProcesses();
});
serverList.forEach(function(server) {
    server.start();
});

spawn('grunt', ['e2e'], {
    detached: false,
    stdio: [ 'inherit', 'inherit', 'inherit' ],
    cwd: '.'
});

