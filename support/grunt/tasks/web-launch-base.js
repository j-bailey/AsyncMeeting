"use strict";

module.exports = function (grunt) {

    var my_http = require("http"),
        url = require("url");

    var server;

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
                console.error('Port ' + grunt.config.get('webLaunchBasePort') + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('Port ' + grunt.config.get('webLaunchBasePort') + ' is already in use');
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

    grunt.registerTask('web-launch-base', function () {
        my_http.createServer(function (request, response) {
            var myPath = url.parse(request.url).pathname;
            console.log('New request ' + myPath);
            if (myPath && myPath === '/checkin') {
                response.write('still alive');
                response.end();
            }
        });
        server.listen(grunt.config.get('webLaunchBasePort'), '127.0.0.1', function () {
            console.log('Web launch server listening on', grunt.config.get('webLaunchBasePort'));
        });
        server.on('error', onError);
        server.on('listening', onListening);
        grunt.webLaunchBaseIsRunning = true;
    });
};
