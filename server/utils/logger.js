var winston = require('winston');
var app = require('../../app');
//winston.emitErrs = true;

var logLevel = "info";

if (app.get('env') === 'development') {
    logLevel = "debug";
}

// Remove default logger and replace
winston.remove(winston.transports.Console);
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
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false
});

module.exports = winston;