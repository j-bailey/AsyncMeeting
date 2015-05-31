var mongoServer = require('./mongo-server'),
    spawn = require('child_process').spawnSync;

// TODO move all NPM JS files to Grunt

var calledBeforeExit = 0,
    serverList = [mongoServer];

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

spawn('gulp', ['dev'], {
    detached: false,
    stdio: [ 'inherit', 'inherit', 'inherit' ],
    cwd: '.'
});

