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


var acl = require('./server/security/acl');
acl.init().then(function() {

    var app = require('./app');
    var debug = require('debug')('AsyncMeeting:server');
    var http = require('http');
    var https = require('https');
    var logger = require('winston');
    var fs = require('fs');

    /**
     * Get port from environment and store in Express.
     */

    var port = parseInt(process.env.PORT, 10) || 3000;
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    var server;

    if (!(process.env.NODE_ENV)  || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev-test') {
        logger.info('Server is running in development mode!');
        server = http.createServer(app);
    } else {
        logger.info('Server is running in ' + process.env.NODE_ENV + ' mode!');
        app.use(function (req, res, next) {
            var aYear = 60 * 60 * 24 * 365;
// Set the Strict Transport Security header for a year
// Also include subdomains
            res.set('Strict-Transport-Security', 'max-age=' + aYear + ';includeSubdomains');
            next();
        });
        var options = {
            key: fs.readFileSync(nconf.get('server:https:keyFile')),
            cert: fs.readFileSync(nconf.get('server:https:certFile'))
        };
        server = https.createServer(options, app);
    }

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port, function () {
        console.log('Server listening on', port);
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
        debug('Listening on port ' + server.address().port);
    }
}).catch(function(err){
    console.error('Errored at start up: ' + err);
    console.error(err.stack);
});

