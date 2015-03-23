var winston = require('winston');
var app = require('../../app');
//winston.emitErrs = true;

winston.remove(winston.transports.Console);

var logLevel = "info";

if ( app.get("env") === "development" ) {
    logLevel = "debug";
}

winston.add(winston.transports.Console, {
    level: logLevel,
    handleExceptions: true,
    json: false,
    colorize: true
});

winston.add(winston.transports.File, {
    level: logLevel,
    filename: './logs/all-logs.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, //5MB
    maxFiles: 5,
    colorize: false
});

module.exports = winston;