/**
 * Created by jlb on 4/19/15.
 */

var childProcess;
var fs = require('fs'),
    nodeFs = require('node-fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

var args = process.argv.slice(2);
var port = args[0];
var cmd = args[1];
var cmdArgs = args.slice(2);

console.log('cmdArgs = ' + cmdArgs);
childProcess = spawn(cmd, cmdArgs, {
    detached: false,
    stdio: 'inherit',
    env: process.env
});


var sys = require("sys"),
    my_http = require("http"),
    path = require("path"),
    url = require("url"),
    filesys = require("fs");

var server = my_http.createServer(function (request, response) {
    var myPath = url.parse(request.url).pathname;
    console.log('New request ' + myPath);
    if (myPath && myPath === '/shutdown') {
        console.log(' ---- Here');
        console.log('Connected');
        childProcess.on('exit', function (code, signal) {
            console.log('child process terminated due to receipt of code ' + code);
            response.statusCode = 200;
            response.end(function () {
                process.exit(0);
            });
        });
        console.log('Before kill');

        childProcess.kill();
    }
});
server.listen(port, '127.0.0.1', function () {
    console.log('Web launch server listening on', port)
});
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('Port ' + port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port ' + port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    console.log('Listening on port ' + server.address().port);
}
