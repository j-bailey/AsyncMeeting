"use strict";

var winston = require('winston');
var nconf = require('nconf');

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
    level: nconf.get("log:consoleLogLevel"),
    handleExceptions: true,
    json: false,
    colorize: true
});

winston.add(winston.transports.File, {
    level: nconf.get("log:fileLogLevel"),
    filename: nconf.get('log:directory') + "/" + nconf.get('log:fileName'),
    handleExceptions: true,
    json: true,
    maxsize: nconf.get('log:maxFileSize'), //5MB
    maxFiles: nconf.get('log:maxFiles'),
    colorize: false
});

module.exports = winston;
