'use strict';

require('../config/configSetup');
var nconf = require('nconf');

var acl = require('./security/acl');
// the worker
//
// This is where we put our bugs!
var domain = require('domain');
// See the cluster documentation for more details about using
// worker processes to serve requests. How it works, caveats, etc.


acl.init().then(function() {
    var app = require('../app');
    var cluster = require('cluster');
    var debug = require('debug')('AsyncMeeting:server');
    var http = require('http');
    var https = require('https');
    var logger = require('winston');
    var fs = require('fs');

    var domainProcessor = function(req, res) {
        var d = domain.create();
        d.on('error', function(er) {
            console.error('error', er.stack);

// Note: we're in dangerous territory!
// By definition, something unexpected occurred,
// which we probably didn't want.
// Anything can happen now! Be very careful!
            try {
// make sure we close down within 30 seconds
                var killtimer = setTimeout(function() {
                    process.exit(1);
                }, 30000);
// But don't keep the process open just for that!
                killtimer.unref();
// stop taking new requests.
                server.close();
// Let the master know we're dead. This will trigger a
// 'disconnect' in the cluster master, and then it will fork
// a new worker.
                cluster.worker.disconnect();
// try to send an error to the request that triggered the problem
                // handle specific listen errors with friendly messages
                switch (er.code) {
                    case 'EACCES':
                        console.error('Port ' + port + ' requires elevated privileges');
                        break;
                    case 'EADDRINUSE':
                        console.error('Port ' + port + ' is already in use');
                        break;
                }

                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Oops, there was a problem!\n');
            } catch (er2) {
// oh well, not much we can do at this point.
                console.error('Error sending 500!', er2.stack);
            }
        });
// Because req and res were created before this domain existed,
// we need to explicitly add them.
        d.add(req);
        d.add(res);
// Now run the handler function in the domain.
        d.run(function() {
            app(req, res);
        });
    };

    /**
     * Get port from environment and store in Express.
     */
    var port = parseInt(nconf.get('PORT'), 10);
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    var server,
        nEnv = nconf.get('NODE_ENV');
    if (nEnv === 'development' || nEnv === 'dev-test') {
        logger.info('Server is running in development mode!');
        server = http.createServer(domainProcessor);
    } else {
        logger.info('Server is running in ' + nEnv + ' mode!');
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
        server = https.createServer(options, domainProcessor);
    }

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port, function () {
        console.log('Server listening on', port);
    });
    server.on('listening', onListening);

    /**
     * Event listener for HTTP server "listening" event.
     */
    function onListening() {
        debug('Listening on port ' + server.address().port);
    }
}).catch(function(err){
    console.error('Error on start up: ' + err);
    console.error(err.stack);
});
